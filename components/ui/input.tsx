import * as React from "react";
import { cn } from "@/lib/utils";
import { controlBase, controlSizes, type ControlSize } from "@/components/ui/field";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: ControlSize;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "md", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          controlBase,
          controlSizes[inputSize],
          // Keep the native date/time picker glyph legible on dark surfaces.
          "dark:[color-scheme:dark]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
