"use client";

import {
  Blocks,
  Calendar,
  MessageCircleQuestion,
  Search,
  Settings2,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { NavChatHistory } from "@/components/nav-chat-history";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserBadge } from "@/components/user-badge";
import { useChat, useUIActions } from "@/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { conversations } = useChat();
  const { setSearchChatsModalOpen } = useUIActions();
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/");
  };

  const chatHistory = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    url: `/c/${conversation.id}`,
    date: new Date(conversation.lastModified).toISOString(),
  }));

  const data = {
    user: {
      email: "john.doe@gmail.com",
      avatar: "https://github.com/shadcn.png",
    },
    navMain: [
      {
        title: "New chat",
        onClick: handleNewChat,
        icon: SquarePen,
        shortcut: "O",
        shiftKey: true,
      },
      {
        title: "Search chats",
        onClick: () => setSearchChatsModalOpen(true),
        icon: Search,
        shortcut: "K",
      },
    ],
    navSecondary: [
      {
        title: "Calendar",
        url: "#",
        icon: Calendar,
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
      },
      {
        title: "Templates",
        url: "#",
        icon: Blocks,
      },
      {
        title: "Trash",
        url: "#",
        icon: Trash2,
      },
      {
        title: "Help",
        url: "#",
        icon: MessageCircleQuestion,
      },
    ],
    projects: [
      {
        name: "Company Website",
        url: "#",
      },
      {
        name: "Company Blog",
        url: "#",
      },
      {
        name: "Travel to Spain",
        url: "#",
      },
    ],
  };

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <UserBadge user={data.user} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavChatHistory chats={chatHistory} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
