"use client";

import { Send, Square } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const InputChat: FC<InputChatProps> = ({ onSubmit, onStop, isLoading }) => {
  const [message, setMessage] = useState("");

  const { config } = useConfig();
  const { setSettingsModalOpen } = useUIActions();
  const canSend = canSendSelectedModel(config);
  const showReasoningSelector = Boolean(
    canSend && getModelConfig(config.selectedModel)?.reasoning.configurable
  );
  const disabledPlaceholder =
    getSelectedModelError(config) ?? "Configure your model settings to continue";

  const handleSendMessage = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <div className="relative flex items-center w-full max-w-[800px] min-w-0">
        <Input
          className={cn(
            "min-h-[56px] w-full rounded-xl py-8 pl-4 text-base backdrop-blur-lg bg-background/50",
            showReasoningSelector ? "pr-[180px]" : canSend ? "pr-14" : "pr-24"
          )}
          placeholder={canSend ? "Ask anything" : disabledPlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading || !canSend}
        />
        {showReasoningSelector ? (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <ReasoningSelector />
          </div>
        ) : null}
        {canSend ? (
          isLoading ? (
            <Button
              size="icon"
              className={cn(
                "absolute right-2 h-10 w-10 rounded-lg",
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
                "absolute right-2 h-10 w-10 rounded-lg",
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
              "absolute right-2 h-10 px-4 rounded-lg",
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
