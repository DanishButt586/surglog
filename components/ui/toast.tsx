import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed confirmation toast. Anchored bottom-right on desktop and stretched to
 * the safe gutters on phones so it can never overflow a 375px viewport.
 */
export function Toast({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl animate-toast-in",
        "bg-emerald-600 text-white",
        "sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm",
        className
      )}
    >
      <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="text-sm font-semibold leading-snug">{message}</span>
    </div>
  );
}
