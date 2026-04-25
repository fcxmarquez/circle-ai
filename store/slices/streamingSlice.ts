import type { StateCreator } from "zustand";
import type { StoreState } from "../types";

export interface StreamingState {
  activeMessageId: string | null;
  content: string;
  thinking: string;
}

export interface StreamingSlice {
  streaming: StreamingState;
  startStreaming: (messageId: string) => void;
  appendStreamingChunk: (chunk: Pick<StreamingState, "content" | "thinking">) => void;
  endStreaming: () => void;
}

const INITIAL_STREAMING: StreamingState = {
  activeMessageId: null,
  content: "",
  thinking: "",
};

export const createStreamingSlice: StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  StreamingSlice
> = (set) => ({
  streaming: INITIAL_STREAMING,

  startStreaming: (messageId) =>
    set(() => ({
      streaming: {
        activeMessageId: messageId,
        content: "",
        thinking: "",
      },
    })),

  appendStreamingChunk: (chunk) =>
    set((state) => ({
      streaming: {
        ...state.streaming,
        content: state.streaming.content + chunk.content,
        thinking: state.streaming.thinking + chunk.thinking,
      },
    })),

  endStreaming: () => set(() => ({ streaming: INITIAL_STREAMING })),
});
