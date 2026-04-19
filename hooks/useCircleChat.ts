import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isLocalModel } from "@/constants/models";
import { streamChatRequest } from "@/lib/chat/client";
import type { ChatMessage, ChatStreamRequest } from "@/lib/chat/contracts";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import { resolveLocalModelSpec } from "@/lib/local/capabilities";
import { streamLocalChatRequest } from "@/lib/local/localTransport";
import { useChat, useChatActions, useConfig } from "@/store";
import { useManageChunks } from "./useManageChunks";

const LOCAL_DOWNLOAD_TOAST_ID = "local-model-download";

async function runLocalStream(options: {
  message: string;
  history: ChatMessage[];
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
}): Promise<string> {
  const spec = await resolveLocalModelSpec();
  let downloadToastShown = false;

  const payload = [
    { role: "system", content: DEFAULT_SYSTEM_PROMPT },
    ...options.history.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: options.message },
  ];

  try {
    return await streamLocalChatRequest({
      spec,
      messages: payload,
      signal: options.signal,
      onChunk: options.onChunk,
      onProgress: (progress) => {
        if (progress.status === "progress" && !downloadToastShown) {
          downloadToastShown = true;
          toast.loading(`Downloading ${spec.label} (~${spec.approximateSizeMB}MB)…`, {
            id: LOCAL_DOWNLOAD_TOAST_ID,
            description: "First-run only. The model is cached for future messages.",
          });
        }
      },
    });
  } finally {
    if (downloadToastShown) {
      toast.dismiss(LOCAL_DOWNLOAD_TOAST_ID);
    }
  }
}

export const useCircleChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const { currentConversationId, messages } = useChat();
  const { config } = useConfig();
  const { createNewConversation, addMessage, setMessageStatus, deleteMessage } =
    useChatActions();
  const { accumulateChunk, flushChunks, flushIntervalRef } = useManageChunks();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const finishStreaming = () => {
    abortControllerRef.current = null;

    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }

    flushChunks();
    isSendingRef.current = false;
    setIsLoading(false);
  };

  const sendMessage = (message: string) => {
    if (isSendingRef.current || isLoading) {
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    isSendingRef.current = true;
    setError(null);
    setIsLoading(true);

    let newConversationId: string | null = null;
    if (!currentConversationId) {
      newConversationId = createNewConversation(trimmedMessage);
    }

    addMessage({
      content: trimmedMessage,
      role: "user",
    });

    const assistantMessage = addMessage({
      content: "",
      role: "assistant",
    });

    const history: ChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let hasResponse = false;

    const useLocal = isLocalModel(config.selectedModel);

    const streamPromise = useLocal
      ? runLocalStream({
          message: trimmedMessage,
          history,
          signal: abortController.signal,
          onChunk: (chunk: string) => {
            hasResponse = true;
            accumulateChunk(assistantMessage.id, chunk);
          },
        })
      : streamChatRequest(
          {
            message: trimmedMessage,
            history,
            config: {
              openAIKey: config.openAIKey,
              anthropicKey: config.anthropicKey,
              googleKey: config.googleKey,
              selectedModel: config.selectedModel,
              reasoningLevel: config.reasoningLevel,
            },
          } satisfies ChatStreamRequest,
          {
            signal: abortController.signal,
            onChunk: (chunk) => {
              hasResponse = true;
              accumulateChunk(assistantMessage.id, chunk);
            },
          }
        );

    void streamPromise
      .then(() => {
        finishStreaming();
        setError(null);
        setMessageStatus(assistantMessage.id, "success");

        if (newConversationId) {
          router.replace(`/c/${newConversationId}`);
        }
      })
      .catch((error: unknown) => {
        const streamError =
          error instanceof Error ? error : new Error("Unknown streaming error");

        finishStreaming();

        if (streamError.name === "AbortError") {
          if (!hasResponse) {
            deleteMessage(assistantMessage.id);
          } else {
            setMessageStatus(assistantMessage.id, "success");
          }

          if (newConversationId) {
            router.replace(`/c/${newConversationId}`);
          }
          return;
        }

        console.error("Streaming error:", streamError);
        setError(streamError);

        if (!hasResponse) {
          deleteMessage(assistantMessage.id);
        } else {
          setMessageStatus(assistantMessage.id, "error");
        }

        const errorMessage = streamError.message.includes("API key")
          ? "Invalid API key. Please check your settings."
          : "Failed to send message. Please try again.";

        toast.error(errorMessage);

        if (newConversationId) {
          router.replace(`/c/${newConversationId}`);
        }
      });
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
  };
};
