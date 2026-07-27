import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatTone = "teal" | "emerald" | "amber";

const toneClasses: Record<StatTone, string> = {
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
};

/**
 * The one stat tile used by the Dashboard and Analytics.
 *
 * Label, value and footnote are a left-aligned stack whose baselines line up
 * across every card in a row; the icon tile is a fixed 48px square pinned to
 * the top so tiles with and without a footnote still align.
 */
export function StatCard({
  label,
  value,
  footnote,
  footnoteIcon: FootnoteIcon,
  footnoteTone = "muted",
  icon: Icon,
  tone = "teal",
  className,
}: {
  label: string;
  value: React.ReactNode;
  footnote?: string;
  footnoteIcon?: React.ComponentType<{ className?: string }>;
  footnoteTone?: "muted" | "positive";
  icon: React.ComponentType<{ className?: string }>;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase leading-none tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold leading-tight tabular-nums text-slate-900 dark:text-white">
            {value}
          </p>
          {footnote && (
            <p
              className={cn(
                "flex items-center gap-1.5 pt-1 text-xs leading-none",
                footnoteTone === "positive"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {FootnoteIcon && <FootnoteIcon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{footnote}</span>
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            toneClasses[tone]
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
