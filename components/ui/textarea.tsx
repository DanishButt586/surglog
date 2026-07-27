import * as React from "react";
import { cn } from "@/lib/utils";
import { controlBase } from "@/components/ui/field";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Matches Input/Select exactly (border, radius, focus ring, dark mode); only
 * the height is free-flowing. Horizontal padding matches the 12px used by the
 * other controls so a textarea's text lines up with the inputs above it.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(controlBase, "min-h-24 px-3 py-2.5 leading-relaxed resize-y", className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
