import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
  variant?: "teal" | "emerald" | "amber";
  label?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, variant, label, ...props }, ref) => {
    const safeMax = max > 0 ? max : 1;
    const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

    const indicatorBg = () => {
      if (variant === "emerald" || percentage >= 100) return "bg-emerald-500 dark:bg-emerald-400";
      if (variant === "amber") return "bg-amber-500 dark:bg-amber-400";
      return "bg-teal-600 dark:bg-teal-400";
    };

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          // The track sits a step darker than the card in both themes so an
          // empty bar is still visible.
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            indicatorBg(),
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
