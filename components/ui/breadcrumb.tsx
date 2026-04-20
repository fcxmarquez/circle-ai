import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a navigation region for breadcrumb navigation with appropriate ARIA labeling.
 *
 * Spreads all standard `<nav>` element props onto the rendered element.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Renders an ordered list for breadcrumb items with horizontal layout and spacing.
 *
 * Merges default styling for breadcrumb lists with any additional class names provided.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb list item with appropriate styling and data attributes.
 *
 * @param className - Additional CSS classes to apply to the list item.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb link as either an anchor element or a custom component.
 *
 * If the `asChild` prop is true, renders the child component provided via the `Slot`; otherwise, renders a standard `<a>` element. Applies styling and accessibility attributes for breadcrumb navigation.
 *
 * @param asChild - If true, renders a custom child component instead of an anchor element.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

/**
 * Renders the current page indicator in a breadcrumb navigation as a styled, accessible span.
 *
 * @remark
 * Sets `aria-current="page"` and `aria-disabled="true"` for accessibility, and uses `role="link"` to indicate its interactive context.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

/**
 * Renders a separator between breadcrumb items, typically a chevron icon.
 *
 * Displays custom children if provided; otherwise, renders a right-chevron icon. The separator is marked as presentational and hidden from assistive technologies.
 *
 * @param children - Optional custom separator content to display instead of the default chevron icon.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * Renders an ellipsis indicator in a breadcrumb, representing collapsed items.
 *
 * Displays a horizontal ellipsis icon and a visually hidden "More" label for screen readers.
 * Marked as presentation and hidden from assistive technologies.
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
