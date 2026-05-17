"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn, groupAndSortChats } from "@/lib/utils";
import { useChat, useChatActions } from "@/store";

export function NavChatHistory({
  chats,
}: {
  chats: {
    id: string;
    title: string;
    url: string;
    date: string;
    isTitleLoading?: boolean;
  }[];
}) {
  const sortedGroupEntries = groupAndSortChats(chats);
  const { currentConversationId } = useChat();
  const { deleteConversation, updateConversationTitle } = useChatActions();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const pendingRenameChatIdRef = useRef<string | null>(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    if (!editingChatId) return;

    const frame = requestAnimationFrame(() => {
      const input = renameInputRef.current;
      if (!input) return;

      input.focus();
      input.select();
    });

    const timer = setTimeout(() => {
      pendingRenameChatIdRef.current = null;
    }, 500);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [editingChatId]);

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteConversation(deleteTargetId);
    setDeleteTargetId(null);
    toast.success("Conversation deleted");
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/c/${conversationId}`);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const startRenamingConversation = (conversationId: string, currentTitle: string) => {
    setEditingChatId(conversationId);
    setDraftTitle(currentTitle);
    setOpenDropdownId(null);
  };

  const commitRenamingConversation = (conversationId: string, currentTitle: string) => {
    const nextTitle = draftTitle.trim();

    if (nextTitle.length > 0 && nextTitle !== currentTitle) {
      updateConversationTitle(conversationId, nextTitle);
    }

    setEditingChatId(null);
    setDraftTitle("");
  };

  return (
    <>
      <SidebarGroup>
        {sortedGroupEntries.map(({ dateLabel, chats: chatsInGroup }) => (
          <div key={dateLabel} className="mb-4">
            <SidebarGroupLabel>{dateLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuSub className="border-0 ml-0">
                  {chatsInGroup.map((chat) => (
                    <SidebarMenuSubItem key={chat.id}>
                      <SidebarMenuSubButton
                        asChild
                        className={cn(
                          currentConversationId === chat.id || openDropdownId === chat.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "",
                          "w-full h-full py-1 px-3"
                        )}
                      >
                        <div
                          role="group"
                          onMouseEnter={() => setHoveredChatId(chat.id)}
                          onMouseLeave={() => setHoveredChatId(null)}
                          className="flex items-center justify-between w-full gap-2"
                        >
                          {editingChatId === chat.id ? (
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={draftTitle}
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setDraftTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  pendingRenameChatIdRef.current = null;
                                  e.currentTarget.blur();
                                }

                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  isCancelledRef.current = true;
                                  pendingRenameChatIdRef.current = null;
                                  e.currentTarget.blur();
                                }
                              }}
                              onBlur={() => {
                                if (isCancelledRef.current) {
                                  isCancelledRef.current = false;
                                  setEditingChatId(null);
                                  setDraftTitle("");
                                  return;
                                }
                                if (pendingRenameChatIdRef.current) {
                                  requestAnimationFrame(() =>
                                    renameInputRef.current?.focus()
                                  );
                                  return;
                                }
                                commitRenamingConversation(chat.id, chat.title);
                              }}
                              className="h-7 flex-1 border-0 bg-transparent p-0 text-inherit shadow-none outline-none ring-0 focus:outline-none focus-visible:ring-0"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConversationClick(chat.id)}
                              className="truncate flex-1 cursor-pointer text-left"
                            >
                              {chat.isTitleLoading ? (
                                <span className="animate-pulse tracking-widest text-muted-foreground">
                                  ···
                                </span>
                              ) : (
                                chat.title
                              )}
                            </button>
                          )}

                          <DropdownMenu
                            onOpenChange={(open) =>
                              setOpenDropdownId(open ? chat.id : null)
                            }
                          >
                            <DropdownMenuTrigger
                              asChild
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                role="button"
                                tabIndex={0}
                                className="inline-flex items-center justify-center"
                              >
                                <MoreHorizontal
                                  className={cn(
                                    "transition-opacity",
                                    isMobile ||
                                      hoveredChatId === chat.id ||
                                      openDropdownId === chat.id ||
                                      editingChatId === chat.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              onCloseAutoFocus={(event) => {
                                if (
                                  pendingRenameChatIdRef.current === chat.id ||
                                  editingChatId === chat.id
                                ) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <DropdownMenuItem
                                onSelect={() => {
                                  pendingRenameChatIdRef.current = chat.id;
                                  startRenamingConversation(chat.id, chat.title);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTargetId(chat.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        ))}
      </SidebarGroup>

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this conversation
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
