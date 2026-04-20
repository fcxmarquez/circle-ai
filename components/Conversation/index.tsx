import type { FC } from "react";

type ConversationProps = {
  title: string;
  selected?: boolean;
};

export const Conversation: FC<ConversationProps> = ({ title, selected }) => {
  return (
    <div
      className={`flex items-center rounded-md p-1 ${
        selected ? "bg-background-conversation" : ""
      }`}
    >
      <p className="pl-1 text-white">{title}</p>
    </div>
  );
};
