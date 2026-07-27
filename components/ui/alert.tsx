import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "error" | "success" | "info";

const tones: Record<AlertTone, { wrapper: string; icon: string; Icon: typeof AlertCircle }> = {
  error: {
    wrapper:
      "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200",
    icon: "text-rose-600 dark:text-rose-400",
    Icon: AlertCircle,
  },
  success: {
    wrapper:
      "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  info: {
    wrapper:
      "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-200",
    icon: "text-teal-600 dark:text-teal-400",
    Icon: Info,
  },
};

/**
 * Inline banner for form-level success/error messaging. One padding, radius and
 * icon alignment for every occurrence (auth pages, case form, target settings).
 */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { wrapper, icon, Icon } = tones[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border p-4", wrapper, className)}
    >
      <Icon className={cn("mt-px h-5 w-5 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="text-sm font-semibold leading-snug">{title}</p>}
        {children && <div className="text-xs leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
