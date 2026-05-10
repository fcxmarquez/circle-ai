"use client";

import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnvProvidersStatusErrorAlertProps {
  isRetrying?: boolean;
  onDismiss?: () => void;
  onRetry: () => void;
}

export function EnvProvidersStatusErrorAlert({
  isRetrying,
  onDismiss,
  onRetry,
}: EnvProvidersStatusErrorAlertProps) {
  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border bg-background p-4 pr-10 shadow-lg"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-3">
        <div>
          <p className="font-medium text-sm">Provider status unavailable</p>
          <p className="text-muted-foreground text-sm">
            Environment API keys could not be checked.
          </p>
        </div>
        <Button
          disabled={isRetrying}
          onClick={onRetry}
          size="sm"
          type="button"
          variant="outline"
        >
          <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
          Retry
        </Button>
      </div>
      {onDismiss ? (
        <Button
          aria-label="Dismiss provider status alert"
          className="absolute top-2 right-2"
          onClick={onDismiss}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
