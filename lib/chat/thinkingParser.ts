import type { ChatStreamEvent } from "./contracts";

export interface ThinkingSplitter {
  push(text: string): ChatStreamEvent[];
  flush(): ChatStreamEvent[];
}

export function createThinkingSplitter(
  openTag = "<think>",
  closeTag = "</think>"
): ThinkingSplitter {
  let buffer = "";
  let inThinking = false;
  const heldTailLength = Math.max(openTag.length, closeTag.length) - 1;

  const emit = (events: ChatStreamEvent[], text: string) => {
    if (!text) return;
    events.push({ t: inThinking ? "thinking" : "content", d: text });
  };

  return {
    push(text) {
      const events: ChatStreamEvent[] = [];
      buffer += text;

      while (buffer) {
        const targetTag = inThinking ? closeTag : openTag;
        const tagIndex = buffer.indexOf(targetTag);

        if (tagIndex !== -1) {
          emit(events, buffer.slice(0, tagIndex));
          buffer = buffer.slice(tagIndex + targetTag.length);
          inThinking = !inThinking;
          continue;
        }

        const safeLength = Math.max(0, buffer.length - heldTailLength);
        if (safeLength === 0) break;

        emit(events, buffer.slice(0, safeLength));
        buffer = buffer.slice(safeLength);
      }

      return events;
    },

    flush() {
      const events: ChatStreamEvent[] = [];
      emit(events, buffer);
      buffer = "";
      return events;
    },
  };
}
