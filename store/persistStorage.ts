import type { PersistStorage, StorageValue } from "zustand/middleware";
import type { Conversation } from "./slices/chats/types";
import type { Config } from "./types";

export interface PersistedSlice {
  chat: { conversations: Conversation[] };
  config: Config;
}

let lastConvos: Conversation[] | null = null;
let lastConfig: Config | null = null;

const isQuotaError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  if (error.name === "QuotaExceededError") return true;
  return /quota/i.test(error.message);
};

export const dedupedJSONStorage: PersistStorage<PersistedSlice> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StorageValue<PersistedSlice>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    const convos = value.state.chat.conversations;
    const config = value.state.config;
    if (convos === lastConvos && config === lastConfig) return;
    lastConvos = convos;
    lastConfig = config;
    try {
      window.localStorage.setItem(
        name,
        JSON.stringify({ state: value.state, version: value.version })
      );
    } catch (error) {
      // Reset cached refs so the next mutation retries the write rather than
      // silently dropping it.
      lastConvos = null;
      lastConfig = null;
      if (isQuotaError(error)) {
        console.warn(
          "[chat-store] localStorage quota exceeded; chat history not saved. " +
            "Consider deleting old conversations."
        );
        return;
      }
      console.warn("[chat-store] persist write failed:", error);
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
    lastConvos = null;
    lastConfig = null;
  },
};
