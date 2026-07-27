import * as React from "react";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The SurgLog wordmark. Previously each surface (landing header, auth headers,
 * sidebar, mobile navbar) drew its own logo tile at a different size, radius
 * and shadow. One component now keeps them identical.
 */
export function Brand({
  size = "md",
  className,
  tagline,
}: {
  size?: "sm" | "md";
  className?: string;
  tagline?: string;
}) {
  const tile = size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl";
  const glyph = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const word = size === "sm" ? "text-base" : "text-lg";

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-teal-600 text-white shadow-sm dark:bg-teal-500 dark:text-slate-900",
          tile
        )}
      >
        <Stethoscope className={glyph} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <span
          className={cn(
            "block truncate font-bold tracking-tight text-slate-900 dark:text-white",
            word
          )}
        >
          SurgLog
        </span>
        {tagline && (
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
