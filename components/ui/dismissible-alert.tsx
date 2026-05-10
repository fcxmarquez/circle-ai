"use client";

import { X } from "lucide-react";
import type * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DismissibleAlertProps
  extends Omit<React.ComponentProps<typeof Alert>, "title"> {
  action?: React.ReactNode;
  description?: React.ReactNode;
  dismissLabel?: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  title?: React.ReactNode;
}

function DismissibleAlert({
  action,
  children,
  className,
  description,
  dismissLabel = "Dismiss alert",
  icon,
  onDismiss,
  title,
  ...props
}: DismissibleAlertProps) {
  return (
    <Alert
      className={cn(icon && "grid-cols-[1rem_1fr] gap-x-3", "pr-10", className)}
      {...props}
    >
      {icon ? (
        <span className="col-start-1 row-span-3 mt-0.5 flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      ) : null}
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {description ? <AlertDescription>{description}</AlertDescription> : null}
      {children ? <div className="col-start-2 min-w-0">{children}</div> : null}
      {action ? (
        <div className="col-start-2 mt-2 flex items-center gap-2">{action}</div>
      ) : null}
      {onDismiss ? (
        <Button
          aria-label={dismissLabel}
          className="absolute top-2 right-2"
          onClick={onDismiss}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </Alert>
  );
}

export { DismissibleAlert };
