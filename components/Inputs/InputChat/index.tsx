"use client";

import { Send, Square } from "lucide-react";
import { type FC, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canSendSelectedModel, getSelectedModelError } from "@/lib/chat/config";
import { getModelConfig } from "@/lib/models";
import { cn } from "@/lib/utils";
import { useConfig, useUIActions } from "@/store";
import { ReasoningSelector } from "./ReasoningSelector";

interface InputChatProps {
  onSubmit: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

const MAX_INPUT_HEIGHT = 200;

export const InputChat: FC<InputChatProps> = ({ onSubmit, onStop, isLoading }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { config } = useConfig();
  const { setSettingsModalOpen } = useUIActions();
  const canSend = canSendSelectedModel(config);
  const showReasoningSelector = Boolean(
    canSend && getModelConfig(config.selectedModel)?.reasoning.configurable
  );
  const inputPaddingClass = showReasoningSelector
    ? "pr-[180px]"
    : canSend
      ? "pr-14"
      : "pr-24";
  const disabledPlaceholder =
    getSelectedModelError(config) ?? "Configure your model settings to continue";

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    if (textarea.value !== message || !textarea.classList.contains(inputPaddingClass)) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_INPUT_HEIGHT ? "auto" : "hidden";
  }, [inputPaddingClass, message]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenSettings = () => {
    setSettingsModalOpen(true);
  };

  return (
    <div className="relative flex justify-center w-full px-4">
      <div className="relative flex w-full max-w-[800px] min-w-0">
        <Textarea
          ref={textareaRef}
          className={cn(
            "min-h-[56px] max-h-[200px] w-full resize-none rounded-xl py-4 pl-4 text-base leading-6 backdrop-blur-lg bg-background/50",
            inputPaddingClass
          )}
          placeholder={canSend ? "Ask anything" : disabledPlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading || !canSend}
          rows={1}
          wrap="soft"
        />
        {showReasoningSelector ? (
          <div className="absolute right-14 bottom-2">
            <ReasoningSelector />
          </div>
        ) : null}
        {canSend ? (
          isLoading ? (
            <Button
              size="icon"
              className={cn(
                "absolute right-2 bottom-2 h-10 w-10 rounded-lg",
                "hover:opacity-90 transition-opacity"
              )}
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              className={cn(
                "absolute right-2 bottom-2 h-10 w-10 rounded-lg",
                "hover:opacity-90 transition-opacity"
              )}
              onClick={handleSendMessage}
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )
        ) : (
          <Button
            className={cn(
              "absolute right-2 bottom-2 h-10 px-4 rounded-lg",
              "hover:opacity-90 transition-opacity"
            )}
            onClick={handleOpenSettings}
            aria-label="Open chat settings"
          >
            Setup
          </Button>
        )}
      </div>
    </div>
  );
};
