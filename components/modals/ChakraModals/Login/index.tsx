"use client";

import { useRouter } from "next/navigation";
import { FiLogIn } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ModalLogin = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <Dialog open>
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            You need to be logged in to use Circle. Please click the button below to
            proceed to the login page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-6 text-center">
          <FiLogIn className="size-10" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-lg">Login Required</h2>
            <p className="max-w-sm text-muted-foreground text-sm">
              You need to be logged in to use Circle. Please click the button below to
              proceed to the login page.
            </p>
          </div>
          <Button onClick={handleLogin}>
            <FiLogIn aria-hidden="true" />
            Go to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
