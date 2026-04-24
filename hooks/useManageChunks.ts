"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ChatStreamEvent } from "@/lib/chat/contracts";
import { useChatActions } from "@/store";

export const useManageChunks = () => {
  const chunkBufferRef = useRef({ content: "", thinking: "" });
  const currentMessageIdRef = useRef("");
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { updateMessageContent, updateMessageThinking } = useChatActions();

  const flushChunks = useCallback(() => {
    if (!currentMessageIdRef.current) {
      return;
    }

    const { content, thinking } = chunkBufferRef.current;

    if (content) {
      updateMessageContent(currentMessageIdRef.current, content);
    }
    if (thinking) {
      updateMessageThinking(currentMessageIdRef.current, thinking);
    }

    if (content || thinking) {
      chunkBufferRef.current = { content: "", thinking: "" };
    }
  }, [updateMessageContent, updateMessageThinking]);

  const accumulateChunk = useCallback(
    (messageId: string, event: ChatStreamEvent) => {
      if (!event.d) return;

      chunkBufferRef.current[event.t] += event.d;
      currentMessageIdRef.current = messageId;

      if (!flushIntervalRef.current) {
        flushIntervalRef.current = setInterval(() => {
          flushChunks();
        }, 100);
      }
    },
    [flushChunks]
  );

  useEffect(() => {
    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
    };
  }, []);

  return { accumulateChunk, flushChunks, flushIntervalRef };
};
