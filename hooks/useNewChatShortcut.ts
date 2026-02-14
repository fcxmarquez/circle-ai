"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Registers a global keyboard shortcut (Cmd+Shift+O on macOS, Ctrl+Shift+O on Windows/Linux)
 * to open a new chat by navigating to the home page.
 */
export function useNewChatShortcut() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "o" && event.shiftKey && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        router.push("/");
        if (isMobile) setOpenMobile(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isMobile, setOpenMobile]);
}
