import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
  variant?: "teal" | "emerald" | "amber";
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, variant, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantBg = () => {
      if (variant === "emerald" || percentage >= 100) return "bg-emerald-500";
      if (variant === "amber") return "bg-amber-500";
      return "bg-teal-600 dark:bg-teal-400";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", getVariantBg(), indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
