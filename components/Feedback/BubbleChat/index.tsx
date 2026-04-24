"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { MarkdownComponents } from "./MarkdownComponents";
import { ThinkingBlock } from "./ThinkingBlock";

interface BubbleChatProps {
  message: string;
  thinking?: string;
  name: string;
  role?: "user" | "assistant";
  status?: "pending" | "success" | "error" | undefined;
  isLastMessage?: boolean;
}

interface ThinkingVisibilityOptions {
  role?: "user" | "assistant";
  thinking?: string;
}

export function shouldShowThinkingBlock({ role, thinking }: ThinkingVisibilityOptions) {
  return role === "assistant" && Boolean(thinking?.trim());
}

export function shouldShowPendingPlaceholder({
  message,
  role,
  status,
  thinking,
}: ThinkingVisibilityOptions & {
  message: string;
  status?: "pending" | "success" | "error" | undefined;
}) {
  return (
    role === "assistant" && status === "pending" && !message.trim() && !thinking?.trim()
  );
}

export const BubbleChat = ({
  message,
  thinking,
  name,
  role = "user",
  status = "pending",
  isLastMessage = false,
}: BubbleChatProps) => {
  const showThinking = shouldShowThinkingBlock({
    role,
    thinking,
  });
  const showPendingPlaceholder = shouldShowPendingPlaceholder({
    message,
    role,
    status,
    thinking,
  });

  return (
    <div className="w-full min-w-0 max-w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-auto flex gap-4 p-4 text-base overflow-hidden">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {role === "assistant" ? (
          <Bot className="h-6 w-6 text-foreground" />
        ) : (
          <User className="h-6 w-6 text-foreground" />
        )}
      </div>
      <div className="flex w-full flex-col min-w-0">
        <span className="mb-1 text-sm font-medium text-foreground">{name}</span>
        {role === "user" ? (
          <div className="self-end rounded-xl px-4 py-2 text-primary-foreground bg-primary">
            {message}
          </div>
        ) : (
          <div
            className={cn(
              "prose prose-sm dark:prose-invert w-full min-w-0 max-w-none text-foreground overflow-x-hidden",
              role === "assistant" && "self-start",
              isLastMessage && "min-h-[calc(100dvh-350px)]"
            )}
          >
            {showThinking ? <ThinkingBlock thinking={thinking} status={status} /> : null}
            {showPendingPlaceholder ? (
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                {message}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
