import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSendMessageStream } from "@/fetch/chat/mutations";
import type { ChatMessage } from "@/lib/langchain/chatService";
import { useChat, useChatActions } from "@/store";
import { useManageChunks } from "./useManageChunks";

export const useCircleChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const { currentConversationId, messages } = useChat();
  const { createNewConversation, addMessage, setMessageStatus, deleteMessage } =
    useChatActions();
  const { accumulateChunk, flushChunks, flushIntervalRef } = useManageChunks();
  const sendMessageStream = useSendMessageStream();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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

    sendMessageStream.mutate({
      message: trimmedMessage,
      history,
      signal: abortController.signal,
      onChunk: (chunk: string) => {
        accumulateChunk(assistantMessage.id, chunk);
      },
      onComplete: () => {
        abortControllerRef.current = null;

        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
          flushIntervalRef.current = null;
        }
        flushChunks();

        isSendingRef.current = false;
        setError(null);
        setIsLoading(false);

        setMessageStatus(assistantMessage.id, "success");

        if (newConversationId) {
          router.replace(`/c/${newConversationId}`);
        }
      },
      onError: (error: Error, partialResponse: string) => {
        abortControllerRef.current = null;

        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
          flushIntervalRef.current = null;
        }
        flushChunks();

        const isAborted = error.name === "AbortError";

        if (isAborted) {
          if (!partialResponse || !partialResponse.trim()) {
            deleteMessage(assistantMessage.id);
          } else {
            setMessageStatus(assistantMessage.id, "success");
          }

          isSendingRef.current = false;
          setIsLoading(false);

          if (newConversationId) {
            router.replace(`/c/${newConversationId}`);
          }
          return;
        }

        console.error("Streaming error:", error);
        setError(error);

        if (!partialResponse || !partialResponse.trim()) {
          deleteMessage(assistantMessage.id);
        } else {
          setMessageStatus(assistantMessage.id, "error");
        }

        const errorMessage = error.message.includes("API key")
          ? "Invalid API key. Please check your settings."
          : "Failed to send message. Please try again.";

        toast.error(errorMessage);
        isSendingRef.current = false;
        setIsLoading(false);

        if (newConversationId) {
          router.replace(`/c/${newConversationId}`);
        }
      },
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
