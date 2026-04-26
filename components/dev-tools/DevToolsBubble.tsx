"use client";

import { Trash2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat, useChatActions, useStreamingActions } from "@/store";

function formatConversationCount(count: number) {
  return count === 1 ? "1 conversation" : `${count} conversations`;
}

export function DevToolsBubble() {
  const router = useRouter();
  const { conversations } = useChat();
  const { clearAllConversations } = useChatActions();
  const { endStreaming } = useStreamingActions();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const conversationCount = conversations.length;

  const handleDeleteAll = () => {
    clearAllConversations();
    endStreaming();
    router.replace("/");
    setIsConfirmOpen(false);
    toast.success("All conversations deleted");
  };

  return (
    <>
      <div className="fixed right-4 bottom-20 z-50">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Open dev tools"
                  className="size-12 rounded-full border-border/80 bg-background/95 shadow-lg backdrop-blur hover:bg-accent"
                >
                  <Wrench className="size-5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">Dev tools</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" side="top" sideOffset={10} className="w-56">
            <DropdownMenuLabel>Dev tools</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={conversationCount === 0}
              onSelect={() => setIsConfirmOpen(true)}
            >
              <Trash2 />
              Delete conversations
              <DropdownMenuShortcut>{conversationCount}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all conversations</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {formatConversationCount(conversationCount)}{" "}
              from the local chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} variant="destructive">
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
