import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading and empty states, standardised so they are always centered, always
 * carry the same vertical rhythm, and always reserve roughly the height of the
 * content they replace — which keeps content from jumping when data arrives.
 */

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 shrink-0 animate-spin text-teal-600 dark:text-teal-400", className)}
      aria-hidden="true"
    />
  );
}

export function LoadingState({
  label = "Loading…",
  className,
  minHeight = "min-h-[220px]",
}: {
  label?: string;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        minHeight,
        className
      )}
    >
      <Spinner className="h-6 w-6" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  minHeight = "min-h-[220px]",
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        minHeight,
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        {description && (
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-center justify-center gap-3 pt-1">{action}</div>}
    </div>
  );
}

/** Inline skeleton block for placeholder content. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/60", className)}
      aria-hidden="true"
    />
  );
}
