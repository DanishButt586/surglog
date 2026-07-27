import * as React from "react";
import { cn } from "@/lib/utils";
import { controlBase, controlSizes, type ControlSize } from "@/components/ui/field";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  selectSize?: ControlSize;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, selectSize = "md", ...props }, ref) => {
    return (
      <select
        className={cn(
          controlBase,
          controlSizes[selectSize],
          "cursor-pointer truncate pr-8 dark:[color-scheme:dark]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
