"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Provides context for tooltip components, enabling configuration of tooltip behavior within its subtree.
 *
 * @param delayDuration - The delay in milliseconds before tooltips appear. Defaults to 0.
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Provides a tooltip context and renders a tooltip root element.
 *
 * Wraps the tooltip root in a provider to ensure consistent tooltip behavior and configuration.
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

/**
 * Renders an element that acts as the trigger for displaying a tooltip.
 *
 * Forwards all props to the underlying Radix UI TooltipPrimitive.Trigger component.
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * Renders styled tooltip content in a portal with an arrow, supporting custom classes and side offset.
 *
 * @param className - Additional CSS classes to apply to the tooltip content.
 * @param sideOffset - Distance in pixels between the tooltip and its trigger. Defaults to 0.
 * @param children - The content to display inside the tooltip.
 *
 * @remark
 * The tooltip content is rendered in a portal and includes a styled arrow. Default styling and animation classes are applied, which can be extended via {@link className}.
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
