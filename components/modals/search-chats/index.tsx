"use client";

import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { groupAndSortChats } from "@/lib/utils";
import { useChat } from "@/store";

interface SearchChatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchChatsDialog({ open, onOpenChange }: SearchChatsDialogProps) {
  const { conversations } = useChat();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const chatHistory = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    url: `/c/${conversation.id}`,
    date: new Date(conversation.lastModified).toISOString(),
  }));

  const groupedChats = groupAndSortChats(chatHistory);

  const handleNewChat = () => {
    router.push("/");
    onOpenChange(false);
    if (isMobile) setOpenMobile(false);
  };

  const handleSelectChat = (url: string) => {
    router.push(url);
    onOpenChange(false);
    if (isMobile) setOpenMobile(false);
  };

  const commandContent = (
    <>
      <CommandInput placeholder="Search chats..." />
      <CommandList>
        <CommandEmpty>No chats found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleNewChat}>
            <SquarePen />
            <span>Create a new chat</span>
          </CommandItem>
        </CommandGroup>
        {groupedChats.map((group) => (
          <CommandGroup key={group.dateLabel} heading={group.dateLabel}>
            {group.chats.map((chat) => (
              <CommandItem key={chat.id} onSelect={() => handleSelectChat(chat.url)}>
                <span>{chat.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Search chats</DrawerTitle>
            <DrawerDescription>Search through your chat conversations</DrawerDescription>
          </DrawerHeader>
          <Command className="min-h-0 flex-1 bg-transparent">{commandContent}</Command>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search chats"
      description="Search through your chat conversations"
    >
      {commandContent}
    </CommandDialog>
  );
}
