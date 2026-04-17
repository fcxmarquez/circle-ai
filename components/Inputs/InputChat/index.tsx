"use client";

import { Send, Square } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConfig, useUIActions } from "@/store";

interface InputChatProps {
  onSubmit: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export const InputChat: FC<InputChatProps> = ({ onSubmit, onStop, isLoading }) => {
  const [message, setMessage] = useState("");

  const { hasValidApiKey } = useConfig();
  const { setSettingsModalOpen } = useUIActions();
  const hasApiKey = hasValidApiKey();

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
            hasApiKey ? "pr-14" : "pr-24"
          )}
          placeholder={
            hasApiKey
              ? "Message EnkiAI..."
              : "Please configure API key in settings to continue"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading || !hasApiKey}
        />
        {hasApiKey ? (
          isLoading ? (
            <Button
              size="icon"
              variant="destructive"
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
            aria-label="Open settings to configure API key"
          >
            Setup
          </Button>
        )}
      </div>
    </div>
  );
};
