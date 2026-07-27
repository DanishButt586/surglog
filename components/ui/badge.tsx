import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "teal";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/70 dark:text-slate-200 dark:border-slate-600",
  teal: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  warning:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  destructive:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
  outline:
    "bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-600",
};

/**
 * Every badge in the app is the same pill: 22px tall, 10px horizontal padding,
 * 11px semibold text, 1px border. Variants change color only — never size,
 * radius or weight. Do not pass text-[10px]/h-* overrides.
 */
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5",
        "text-[11px] font-semibold leading-none tracking-tight transition-colors",
        "[&_svg]:h-3 [&_svg]:w-3 [&_svg]:shrink-0",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
