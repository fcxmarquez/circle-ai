"use client";

import { BubbleChat } from "@/components/Feedback/BubbleChat";
import { useStore } from "@/store";
import type { Message } from "@/store/slices/chats/types";

interface ThreadProps {
  messages: Message[];
}

export const Thread = ({ messages }: ThreadProps) => {
  const streaming = useStore((state) => state.streaming);

  return (
    <>
      {messages.map((message, index) => {
        const isStreaming = streaming.activeMessageId === message.id;
        const isThinking =
          isStreaming && Boolean(streaming.thinking.trim()) && !streaming.content.trim();

        return (
          <BubbleChat
            key={message.id}
            message={isStreaming ? streaming.content : message.content}
            thinking={isStreaming ? streaming.thinking : message.thinking}
            name={message.role === "assistant" ? "Circle" : "You"}
            role={message.role}
            status={message.status}
            isThinking={isThinking}
            isLastMessage={index === messages.length - 1}
          />
        );
      })}
    </>
  );
};
