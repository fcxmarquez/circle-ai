"use client";

import { Command, type LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * Renders a sidebar navigation menu with a list of items, each displaying an icon and title.
 *
 * @param items - Array of navigation items, each with a title, icon, and click handler.
 * @returns A sidebar menu component populated with the provided navigation items.
 */
export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: LucideIcon;
    onClick: () => void;
    shortcut?: string;
    shiftKey?: boolean;
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const isMac = useSyncExternalStore(
    () => () => {},
    () => navigator.userAgent.toUpperCase().includes("MAC"),
    () => false
  );

  const handleClick = (onClick: () => void) => {
    onClick();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={false}>
            <button
              type="button"
              className="group/navitem"
              onClick={() => handleClick(item.onClick)}
            >
              <div className="flex size-6 items-center justify-center">
                <item.icon className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <span>{item.title}</span>
              {item.shortcut && !isMobile && (
                <kbd className="ml-auto hidden items-center gap-0.5 text-xs text-muted-foreground group-hover/navitem:inline-flex">
                  {isMac ? <Command className="size-3" /> : "Ctrl"}{" "}
                  {item.shiftKey && "Shift "}
                  {item.shortcut}
                </kbd>
              )}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
