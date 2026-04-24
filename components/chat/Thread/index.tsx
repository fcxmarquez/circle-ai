import { BubbleChat } from "@/components/Feedback/BubbleChat";
import type { Message } from "@/store/slices/chats/types";

interface ThreadProps {
  messages: Message[];
}

export const Thread = ({ messages }: ThreadProps) => {
  return (
    <>
      {messages.map((message) => (
        <BubbleChat
          key={message.id}
          message={message.content}
          thinking={message.thinking}
          name={message.role === "assistant" ? "Circle" : "You"}
          role={message.role}
          status={message.status}
          isLastMessage={message.id === messages[messages.length - 1].id}
        />
      ))}
    </>
  );
};
