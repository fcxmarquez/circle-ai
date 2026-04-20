"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a popover root component that manages the open/close state and context for its children.
 *
 * All props are forwarded to the underlying Radix UI Popover root component.
 */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * Renders a popover trigger element that opens or closes the associated popover when interacted with.
 *
 * Forwards all props to the underlying trigger component and adds a `data-slot="popover-trigger"` attribute for identification.
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * Displays popover content in a styled, layered portal with customizable alignment and offset.
 *
 * @param className - Additional CSS classes to apply to the popover content.
 * @param align - Alignment of the popover relative to its trigger. Defaults to "center".
 * @param sideOffset - Distance in pixels between the popover and its trigger. Defaults to 4.
 *
 * @remark
 * The content is rendered inside a portal for proper layering and includes animation and styling classes by default.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/****
 * Renders a popover anchor element, serving as a reference point for popover positioning.
 *
 * Forwards all props to the underlying Radix UI Popover Anchor and adds a `data-slot="popover-anchor"` attribute for identification.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
