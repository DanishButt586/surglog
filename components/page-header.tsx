import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The single page-header used by every route in the dashboard shell.
 *
 * Guarantees one h1 size/weight, one description style, and one responsive
 * behaviour: title block and actions stack on mobile (actions left-aligned,
 * never stretched full-width) and sit on one baseline-aligned row from sm up.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {Icon && <Icon className="h-6 w-6 shrink-0 text-teal-600 dark:text-teal-400" />}
          <span className="min-w-0">{title}</span>
        </h1>
        {description && (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
      )}
    </div>
  );
}
