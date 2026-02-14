"use client";

import { useEffect } from "react";
import { useUI, useUIActions } from "@/store";

/**
 * Registers a global keyboard shortcut (Cmd+K on macOS, Ctrl+K on Windows/Linux)
 * to toggle the search chats modal.
 */
export function useSearchChatsShortcut() {
  const { modals } = useUI();
  const { setSearchChatsModalOpen } = useUIActions();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchChatsModalOpen(!modals.searchChats);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchChatsModalOpen, modals.searchChats]);
}
