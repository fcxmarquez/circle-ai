"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUI, useUIActions } from "@/store";

export const ModalRender = () => {
  const { hideModal } = useUIActions();
  const { modal } = useUI();

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          hideModal();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">{modal.children}</DialogContent>
    </Dialog>
  );
};
