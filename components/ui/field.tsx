import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared geometry for every form control in the app (text input, number, date,
 * select and textarea). Defined once so heights, borders, radius, focus ring
 * and disabled styling can never drift apart between pages.
 */
export const controlBase = cn(
  "w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900",
  "placeholder:text-slate-400 transition-colors",
  "focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50",
  "dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
);

/** Control heights, matched 1:1 to the Button size scale. */
export const controlSizes = {
  xs: "h-8 px-2.5 text-xs",
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3 text-sm",
} as const;

export type ControlSize = keyof typeof controlSizes;

/**
 * Label + control + optional hint/error, with one consistent label style and a
 * fixed 6px label→control gap. Wiring `htmlFor` to the control's id is handled
 * automatically so clicking a label always focuses its input.
 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  labelAction,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Trailing control on the label row (e.g. a "Forgot password?" link). */
  labelAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || labelAction) && (
        <div className="flex min-h-4 items-center justify-between gap-2">
          {label && (
            <label
              htmlFor={htmlFor}
              className="block text-xs font-semibold leading-none text-slate-700 dark:text-slate-300"
            >
              {label}
              {required && (
                <span className="ml-0.5 text-rose-500" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
