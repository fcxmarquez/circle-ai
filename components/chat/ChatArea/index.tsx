"use client";

import { ArrowDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { hasActiveSession } from "@/utils/supabase/session";
import { Thread } from "@/components/chat/Thread";
import { InputChat } from "@/components/Inputs/InputChat";
// TEMP: Disabled for rebuild - FCX-30
// import { ModalLogin } from "@/components/Modals/ChakraModals/Login";
import { colors } from "@/constants/systemDesign/colors";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useCircleChat } from "@/hooks/useCircleChat";
import { useConfig, useUIActions } from "@/store";

export const ChatArea = () => {
  // const { setSettingsModalOpen } = useUIActions();
  const [isMounted, setIsMounted] = useState(false);
  const { setSettingsModalOpen } = useUIActions();
  const { hasValidApiKey } = useConfig();
  const hasApiKey = hasValidApiKey();
  const { sendMessage, stopGeneration, isLoading, messages, isError, error } =
    useCircleChat();
  // TEMP: Disabled for rebuild - FCX-30
  // const [hasSession, setHasSession] = useState<boolean | null>(null);

  const lastMessage = messages[messages.length - 1];
  const followKey = lastMessage?.id;

  const {
    scrollContainerRef,
    showScrollButton,
    onScroll,
    scrollToBottom,
    scheduleScrollToBottom,
  } = useChatScroll({
    enabled: isMounted,
    followKey,
    isLoading,
  });

  useEffect(() => {
    if (isError && error?.message?.includes("API key")) {
      setSettingsModalOpen(true);
    }
  }, [error, isError, setSettingsModalOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Prevent hydration issues by not rendering until client-side
  if (!isMounted) {
    return null;
  }

  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;

    if (!hasApiKey) {
      toast.warning("Please configure your API key in settings to continue.");
      setSettingsModalOpen(true);
      return;
    }

    sendMessage(message);
    scheduleScrollToBottom("smooth");
  };

  return (
    <div className="flex flex-col flex-1 max-h-[calc(100vh-56px)] h-full overflow-hidden max-w-full">
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={onScroll}
          className="absolute inset-0 flex flex-col w-full overflow-y-auto overflow-x-hidden"
        >
          <div className="max-w-[800px] w-full mx-auto min-h-full">
            {messages.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-1 flex-col items-center justify-center gap-4 text-center">
                <h3 className="text-lg font-semibold text-text-default">
                  Welcome to EnkiAI!
                </h3>
                <p style={{ color: colors.text.paragraph }} className="max-w-md">
                  Start a conversation by typing a message below. The AI supports markdown
                  formatting, code highlighting, and more.
                </p>
              </div>
            ) : (
              <Thread messages={messages} />
            )}
          </div>
        </div>

        <AnimatePresence>
          {showScrollButton ? (
            <motion.button
              type="button"
              aria-label="Scroll to bottom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-4 rounded-full p-2 border-foreground bg-background border"
              onClick={() => {
                scrollToBottom("smooth");
              }}
            >
              <ArrowDownIcon className="w-4 h-4 text-foreground" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="w-full py-8">
        <InputChat
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onStop={stopGeneration}
        />
      </div>
    </div>
  );
};
