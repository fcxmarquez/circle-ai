import { BubbleChat } from "@/components/Feedback/BubbleChat";
import type { Message } from "@/store/slices/chatSlice";

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
          name={message.role === "assistant" ? "Circle" : "You"}
          role={message.role}
          status={message.status}
          isLastMessage={message.id === messages[messages.length - 1].id}
        />
      ))}
    </>
  );
};
