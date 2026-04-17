import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  DEFAULT_ENABLED_MODELS,
  DEFAULT_MODEL,
  getModelConfig,
  MODEL_VALUES,
} from "@/constants/models";
import { createChatSlice } from "./slices/chatSlice";
import { createConfigSlice } from "./slices/configSlice";
import { createUISlice } from "./slices/uiSlice";
import { createUserSlice } from "./slices/userSlice";
import type { Config, StoreState } from "./types";

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...createUISlice(set, get, api),
        ...createChatSlice(set, get, api),
        ...createConfigSlice(set, get, api),
        ...createUserSlice(set, get, api),
      }),
      {
        name: "chat-store",
        version: 3,
        migrate: (persistedState, version) => {
          const state = persistedState as { config?: Partial<Config> } | undefined;
          if (version < 2 && state?.config && state.config.reasoningLevel === undefined) {
            const model = state.config.selectedModel ?? DEFAULT_MODEL;
            state.config.reasoningLevel =
              getModelConfig(model)?.reasoning.defaultLevel ?? "none";
          }
          if (version < 3 && state?.config) {
            const validModels = new Set<string>(MODEL_VALUES);
            if (
              state.config.selectedModel &&
              !validModels.has(state.config.selectedModel)
            ) {
              state.config.selectedModel = DEFAULT_MODEL;
              state.config.reasoningLevel =
                getModelConfig(DEFAULT_MODEL)?.reasoning.defaultLevel ?? "none";
            }
            if (Array.isArray(state.config.enabledModels)) {
              const filtered = state.config.enabledModels.filter((m) =>
                validModels.has(m)
              );
              state.config.enabledModels =
                filtered.length > 0 ? filtered : [...DEFAULT_ENABLED_MODELS];
            }
          }
          return state;
        },
        partialize: (state) => ({
          chat: {
            conversations: state.chat.conversations,
          },
          config: state.config,
        }),
      }
    )
  )
);

// Selector hooks
export const useUI = () => {
  const ui = useStore((state) => state.ui);
  return ui;
};

export const useUIActions = () => {
  const showModal = useStore((state) => state.showModal);
  const hideModal = useStore((state) => state.hideModal);
  const setSettingsModalOpen = useStore((state) => state.setSettingsModalOpen);
  const setSearchChatsModalOpen = useStore((state) => state.setSearchChatsModalOpen);

  return {
    showModal,
    hideModal,
    setSettingsModalOpen,
    setSearchChatsModalOpen,
  };
};

export const useChat = () => {
  const chat = useStore((state) => state.chat);
  const currentConversation = useStore((state) =>
    state.chat.conversations.find((conv) => conv.id === state.chat.currentConversationId)
  );

  return {
    ...chat,
    messages: currentConversation?.messages || [],
  };
};

export const useChatActions = () => {
  const addMessage = useStore((state) => state.addMessage);
  const setChatError = useStore((state) => state.setChatError);
  const clearChat = useStore((state) => state.clearChat);
  const createNewConversation = useStore((state) => state.createNewConversation);
  const setCurrentConversation = useStore((state) => state.setCurrentConversation);
  const updateConversationTitle = useStore((state) => state.updateConversationTitle);
  const deleteConversation = useStore((state) => state.deleteConversation);
  const deleteMessage = useStore((state) => state.deleteMessage);
  const updateMessageContent = useStore((state) => state.updateMessageContent);
  const deleteLastMessage = useStore((state) => state.deleteLastMessage);
  const lastMessageToError = useStore((state) => state.lastMessageToError);
  const setMessageStatus = useStore((state) => state.setMessageStatus);

  return {
    addMessage,
    setChatError,
    clearChat,
    createNewConversation,
    setCurrentConversation,
    updateConversationTitle,
    deleteConversation,
    deleteMessage,
    updateMessageContent,
    deleteLastMessage,
    setMessageStatus,
    lastMessageToError,
  };
};

export const useConfig = () => {
  const config = useStore((state) => state.config);
  const setConfig = useStore((state) => state.setConfig);
  const clearConfig = useStore((state) => state.clearConfig);

  return {
    config,
    setConfig,
    clearConfig,
  };
};

export const useUser = () => {
  return useStore((state) => state.user);
};

export const useUserActions = () => {
  const setIsSignedIn = useStore((state) => state.setIsSignedIn);
  const setUserEmail = useStore((state) => state.setUserEmail);
  const setLogout = useStore((state) => state.setLogout);

  return { setIsSignedIn, setUserEmail, setLogout };
};
