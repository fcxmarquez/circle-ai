import type { ChatMessage, ChatModelConfig } from "@/lib/chat/contracts";
import type { LocalModelSpec } from "@/lib/local/capabilities";

export type MessageStatus = "pending" | "success" | "error";

export interface Message {
  id: string;
  content: string;
  thinking?: string;
  role: "user" | "assistant";
  timestamp: number;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}

export interface PendingChatRequest {
  conversationId: string;
  assistantMessageId: string;
  message: string;
  history: ChatMessage[];
  config: ChatModelConfig;
  localSpec?: LocalModelSpec;
}

export interface ChatSlice {
  chat: {
    conversations: Conversation[];
    currentConversationId: string | null;
    error: string | null;
    pendingRequest: PendingChatRequest | null;
  };
  addMessage: (message: Omit<Message, "id" | "timestamp" | "status">) => Message;
  setChatError: (error: string | null) => void;
  setPendingRequest: (request: PendingChatRequest | null) => void;
  clearChat: () => void;
  createNewConversation: (initialMessage: string) => string;
  setCurrentConversation: (conversationId: string | null) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  deleteMessage: (messageId: string) => void;
  deleteLastMessage: () => void;
  setMessageContent: (messageId: string, content: string, thinking?: string) => void;
  setMessageStatus: (messageId: string, status: MessageStatus) => void;
  lastMessageToError: () => void;
}
