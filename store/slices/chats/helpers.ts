import type { StoreState } from "../../types";

export const getCurrentConversationIndex = (state: StoreState) => {
  return state.chat.conversations.findIndex(
    (conv) => conv.id === state.chat.currentConversationId
  );
};

export const findMessageLocation = (state: StoreState, messageId: string) => {
  const currentConversationIndex = getCurrentConversationIndex(state);

  if (currentConversationIndex !== -1) {
    const currentConversation = state.chat.conversations[currentConversationIndex];
    const messageIndex = currentConversation.messages.findIndex(
      (msg) => msg.id === messageId
    );

    if (messageIndex !== -1) {
      return { conversationIndex: currentConversationIndex, messageIndex };
    }
  }

  for (
    let conversationIndex = 0;
    conversationIndex < state.chat.conversations.length;
    conversationIndex++
  ) {
    if (conversationIndex === currentConversationIndex) continue;

    const conversation = state.chat.conversations[conversationIndex];
    const messageIndex = conversation.messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex !== -1) {
      return { conversationIndex, messageIndex };
    }
  }

  return null;
};
