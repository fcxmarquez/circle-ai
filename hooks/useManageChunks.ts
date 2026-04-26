"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ChatStreamEvent } from "@/lib/chat/contracts";
import { useStore, useStreamingActions } from "@/store";

export const useManageChunks = () => {
  const pendingRef = useRef({ content: "", thinking: "" });
  const rafIdRef = useRef<number | null>(null);
  const ownedIdRef = useRef<string | null>(null);

  const { appendStreamingChunk } = useStreamingActions();

  const flush = useCallback(() => {
    rafIdRef.current = null;
    const ownedId = ownedIdRef.current;
    const buffered = pendingRef.current;
    pendingRef.current = { content: "", thinking: "" };

    if (!ownedId) return;
    if (useStore.getState().streaming.activeMessageId !== ownedId) return;
    if (!buffered.content && !buffered.thinking) return;

    appendStreamingChunk(buffered);
  }, [appendStreamingChunk]);

  const accumulateChunk = useCallback(
    (messageId: string, event: ChatStreamEvent) => {
      if (!event.d) return;
      if (useStore.getState().streaming.activeMessageId !== messageId) return;

      if (ownedIdRef.current !== messageId) {
        pendingRef.current = { content: "", thinking: "" };
      }
      ownedIdRef.current = messageId;
      pendingRef.current[event.t] += event.d;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flush);
      }
    },
    [flush]
  );

  const flushImmediately = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    flush();
  }, [flush]);

  const discardPending = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingRef.current = { content: "", thinking: "" };
    ownedIdRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  return { accumulateChunk, flushImmediately, discardPending };
};
