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
import { LocalModelConsentDialog } from "@/components/modals/local-model-consent";
import { isLocalModel } from "@/constants/models";
import { colors } from "@/constants/systemDesign/colors";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useCircleChat } from "@/hooks/useCircleChat";
import { useLocalModelConsent } from "@/hooks/useLocalModelConsent";
import { canSendSelectedModel, getSelectedModelError } from "@/lib/chat/config";
import { useConfig, useUIActions } from "@/store";

export const ChatArea = () => {
  // const { setSettingsModalOpen } = useUIActions();
  const [isMounted, setIsMounted] = useState(false);
  const { setSettingsModalOpen } = useUIActions();
  const { config } = useConfig();
  const canSend = canSendSelectedModel(config);
  const {
    sendMessage,
    stopGeneration,
    isLoading,
    messages,
    isError,
    error,
    localModelStatus,
    localModelSpec,
  } = useCircleChat();
  const consent = useLocalModelConsent();
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
    if (!localModelSpec) return;

    const LOCAL_DOWNLOAD_TOAST_ID = "local-model-download";
    const sizeLabel =
      localModelSpec.approximateSizeMB >= 1000
        ? `~${(localModelSpec.approximateSizeMB / 1000).toFixed(1)} GB`
        : `~${localModelSpec.approximateSizeMB} MB`;

    if (localModelStatus === "downloading") {
      toast.loading(`Downloading ${localModelSpec.label} (${sizeLabel})…`, {
        id: LOCAL_DOWNLOAD_TOAST_ID,
        description: "First-run only. The model is cached for future messages.",
      });
    } else if (localModelStatus === "loading-cache") {
      toast.loading(`Loading ${localModelSpec.label} from cache…`, {
        id: LOCAL_DOWNLOAD_TOAST_ID,
        description: "Warming up the local model.",
      });
    } else if (localModelStatus === "ready" || localModelStatus === "idle") {
      toast.dismiss(LOCAL_DOWNLOAD_TOAST_ID);
    }
  }, [localModelStatus, localModelSpec]);

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

    if (!canSend) {
      toast.warning(
        getSelectedModelError(config) ??
          "Please configure your chat settings to continue."
      );
      setSettingsModalOpen(true);
      return;
    }

    if (isLocalModel(config.selectedModel)) {
      const spec = await consent.requestConsent();
      if (!spec) return;
      sendMessage(message, spec);
      scheduleScrollToBottom("smooth");
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

      <LocalModelConsentDialog
        open={consent.open}
        spec={consent.spec}
        onConfirm={consent.confirm}
        onCancel={consent.cancel}
        onAddApiKey={() => {
          consent.cancel();
          setSettingsModalOpen(true);
        }}
      />
    </div>
  );
};
