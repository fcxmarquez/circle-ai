"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DismissibleAlert } from "@/components/ui/dismissible-alert";
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
    <DismissibleAlert
      action={
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
      }
      className="fixed right-4 bottom-4 z-50 max-w-sm shadow-lg"
      description="Environment API keys could not be checked."
      dismissLabel="Dismiss provider status alert"
      icon={<AlertCircle className="text-destructive" />}
      onDismiss={onDismiss}
      title="Provider status unavailable"
    />
  );
}
