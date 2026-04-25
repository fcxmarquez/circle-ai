import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isLocalModel } from "@/constants/models";
import { streamChatRequest } from "@/lib/chat/client";
import type {
  ChatMessage,
  ChatModelConfig,
  ChatStreamRequest,
} from "@/lib/chat/contracts";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import { createThinkingSplitter, type ThinkingSplitter } from "@/lib/chat/thinkingParser";
import type { LocalModelSpec } from "@/lib/local/capabilities";
import {
  MODEL_DOWNLOADED_KEY_PREFIX,
  streamLocalChatRequest,
} from "@/lib/local/localTransport";
import {
  useChat,
  useChatActions,
  useConfig,
  useStore,
  useStreamingActions,
} from "@/store";
import type { PendingChatRequest } from "@/store/slices/chats/types";
import { useManageChunks } from "./useManageChunks";

export type LocalModelStatus = "idle" | "downloading" | "loading-cache" | "ready";

async function runLocalStream(options: {
  spec: LocalModelSpec;
  message: string;
  history: ChatMessage[];
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
  onModelStatus: (status: LocalModelStatus, spec: LocalModelSpec) => void;
}): Promise<string> {
  const { spec } = options;

  const payload = [
    { role: "system", content: DEFAULT_SYSTEM_PROMPT },
    ...options.history.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: options.message },
  ];

  return await streamLocalChatRequest({
    spec,
    messages: payload,
    signal: options.signal,
    onChunk: options.onChunk,

    onProgress: (progress) => {
      const cacheKey = `${MODEL_DOWNLOADED_KEY_PREFIX}${spec.modelId}`;

      if (progress.status === "ready") {
        localStorage.setItem(cacheKey, "true");
        options.onModelStatus("ready", spec);
      }

      if (progress.status === "download") {
        const isCached = !!localStorage.getItem(cacheKey);
        options.onModelStatus(isCached ? "loading-cache" : "downloading", spec);
      }
    },
  });
}

export const useCircleChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus>("idle");
  const [localModelSpec, setLocalModelSpec] = useState<LocalModelSpec | null>(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const thinkingSplitterRef = useRef<ThinkingSplitter | null>(null);
  const router = useRouter();
  const params = useParams<{ conversationId?: string }>();
  const routeConversationId =
    typeof params.conversationId === "string" ? params.conversationId : undefined;
  const { currentConversationId, messages, pendingRequest } = useChat();
  const { config } = useConfig();
  const {
    createNewConversation,
    addMessage,
    setMessageStatus,
    setMessageContent,
    deleteMessage,
    setPendingRequest,
  } = useChatActions();
  const { startStreaming, endStreaming } = useStreamingActions();
  const { accumulateChunk, flushImmediately, discardPending } = useManageChunks();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const finishStreaming = useCallback(
    (messageId: string) => {
      const stillOwnsStream = useStore.getState().streaming.activeMessageId === messageId;

      let flushedSplitter = false;

      if (stillOwnsStream) {
        const splitter = thinkingSplitterRef.current;
        if (splitter) {
          const events = splitter.flush();
          flushedSplitter = events.length > 0;
          for (const event of events) {
            accumulateChunk(messageId, event);
          }
        }

        flushImmediately();

        const { activeMessageId, content, thinking } = useStore.getState().streaming;
        if (activeMessageId === messageId) {
          setMessageContent(messageId, content, thinking || undefined);
          endStreaming();
        }
      } else {
        discardPending();
      }

      abortControllerRef.current = null;
      thinkingSplitterRef.current = null;
      isSendingRef.current = false;
      setIsLoading(false);
      setLocalModelStatus("idle");

      return flushedSplitter;
    },
    [accumulateChunk, discardPending, endStreaming, flushImmediately, setMessageContent]
  );

  const startStreamingRequest = useCallback(
    (request: PendingChatRequest) => {
      if (isSendingRef.current || isLoading) {
        return;
      }

      isSendingRef.current = true;
      setError(null);
      setIsLoading(true);
      startStreaming(request.assistantMessageId);

      const useLocal = isLocalModel(request.config.selectedModel);

      if (useLocal && !request.localSpec) {
        finishStreaming(request.assistantMessageId);
        deleteMessage(request.assistantMessageId);
        toast.error("Local model requires consent before sending.");
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      let hasResponse = false;

      const localThinkingSplitter = useLocal ? createThinkingSplitter() : null;
      thinkingSplitterRef.current = localThinkingSplitter;

      const streamPromise = useLocal
        ? runLocalStream({
            spec: request.localSpec as LocalModelSpec,
            message: request.message,
            history: request.history,
            signal: abortController.signal,
            onChunk: (chunk: string) => {
              const events = localThinkingSplitter?.push(chunk) ?? [
                { t: "content" as const, d: chunk },
              ];
              if (events.length > 0) {
                hasResponse = true;
              }
              for (const event of events) {
                accumulateChunk(request.assistantMessageId, event);
              }
            },
            onModelStatus: (status, spec) => {
              setLocalModelStatus(status);
              setLocalModelSpec(spec);
            },
          })
        : streamChatRequest(
            {
              message: request.message,
              history: request.history,
              config: request.config,
            } satisfies ChatStreamRequest,
            {
              signal: abortController.signal,
              onChunk: (event) => {
                hasResponse = true;
                accumulateChunk(request.assistantMessageId, event);
              },
            }
          );

      void streamPromise
        .then(() => {
          finishStreaming(request.assistantMessageId);
          setError(null);
          setMessageStatus(request.assistantMessageId, "success");
        })
        .catch((error: unknown) => {
          const streamError =
            error instanceof Error ? error : new Error("Unknown streaming error");

          const flushedPendingResponse = finishStreaming(request.assistantMessageId);
          hasResponse = hasResponse || flushedPendingResponse;

          if (streamError.name === "AbortError") {
            if (!hasResponse) {
              deleteMessage(request.assistantMessageId);
            } else {
              setMessageStatus(request.assistantMessageId, "success");
            }
            return;
          }

          console.error("Streaming error:", streamError);
          setError(streamError);

          if (!hasResponse) {
            deleteMessage(request.assistantMessageId);
          } else {
            setMessageStatus(request.assistantMessageId, "error");
          }

          const errorMessage = streamError.message.includes("API key")
            ? "Invalid API key. Please check your settings."
            : "Failed to send message. Please try again.";

          toast.error(errorMessage);
        });
    },
    [
      accumulateChunk,
      deleteMessage,
      finishStreaming,
      isLoading,
      setMessageStatus,
      startStreaming,
    ]
  );

  useEffect(() => {
    if (!pendingRequest) return;
    if (pendingRequest.conversationId !== routeConversationId) return;
    if (pendingRequest.conversationId !== currentConversationId) return;

    setPendingRequest(null);
    startStreamingRequest(pendingRequest);
  }, [
    currentConversationId,
    pendingRequest,
    routeConversationId,
    setPendingRequest,
    startStreamingRequest,
  ]);

  const sendMessage = (message: string, localSpec?: LocalModelSpec) => {
    if (isSendingRef.current || isLoading) {
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setError(null);

    const useLocal = isLocalModel(config.selectedModel);
    if (useLocal && !localSpec) {
      toast.error("Local model requires consent before sending.");
      return;
    }

    const history: ChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestConfig: ChatModelConfig = {
      openAIKey: config.openAIKey,
      anthropicKey: config.anthropicKey,
      googleKey: config.googleKey,
      selectedModel: config.selectedModel,
      reasoningLevel: config.reasoningLevel,
    };

    const isNewConversation = !currentConversationId;
    const conversationId = isNewConversation
      ? createNewConversation(trimmedMessage)
      : currentConversationId;

    addMessage({
      content: trimmedMessage,
      role: "user",
    });

    const assistantMessage = addMessage({
      content: "",
      role: "assistant",
    });

    const request: PendingChatRequest = {
      assistantMessageId: assistantMessage.id,
      conversationId,
      message: trimmedMessage,
      history,
      config: requestConfig,
      ...(localSpec ? { localSpec } : {}),
    };

    if (isNewConversation) {
      isSendingRef.current = true;
      setIsLoading(true);
      setPendingRequest(request);
      router.replace(`/c/${conversationId}`);
      return;
    }

    startStreamingRequest(request);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    isError: Boolean(error),
    error,
    messages,
    sendMessage,
    stopGeneration,
    isLoading,
    localModelStatus,
    localModelSpec,
  };
};
