"use client";

import { useNewChatShortcut } from "@/hooks/useNewChatShortcut";
import { useSearchChatsShortcut } from "@/hooks/useSearchChatsShortcut";

export function GlobalShortcuts() {
  useNewChatShortcut();
  useSearchChatsShortcut();
  return null;
}
