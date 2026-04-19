"use client";

import { Download, KeyRound } from "lucide-react";
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
import type { LocalModelSpec } from "@/lib/local/capabilities";

interface LocalModelConsentDialogProps {
  open: boolean;
  spec: LocalModelSpec | null;
  onConfirm: () => void;
  onCancel: () => void;
  onAddApiKey: () => void;
}

export function LocalModelConsentDialog({
  open,
  spec,
  onConfirm,
  onCancel,
  onAddApiKey,
}: LocalModelConsentDialogProps) {
  if (!spec) return null;

  const sizeLabel =
    spec.approximateSizeMB >= 1000
      ? `~${(spec.approximateSizeMB / 1000).toFixed(1)} GB`
      : `~${spec.approximateSizeMB} MB`;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download AI model?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                <strong className="text-foreground">{spec.label}</strong> ({sizeLabel})
                will be downloaded to your browser to run locally — no API key required.
              </p>
              <p>This is a one-time download and will be cached for future sessions.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={onAddApiKey} className="gap-2">
            <KeyRound className="h-4 w-4" />
            Add API key instead
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="gap-2">
            <Download className="h-4 w-4" />
            Download & continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
