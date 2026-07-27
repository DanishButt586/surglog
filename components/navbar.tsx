"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";

/**
 * Route → navbar heading. Keeps the top bar describing the page you are
 * actually on instead of one hard-coded label on every route.
 */
const ROUTE_TITLES: { match: (path: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p.startsWith("/dashboard"), title: "Dashboard", subtitle: "ACGME / RCS requirement tracking" },
  { match: (p) => p === "/cases/new", title: "Log New Case", subtitle: "Add an operative entry to your logbook" },
  { match: (p) => /^\/cases\/[^/]+/.test(p), title: "Edit Case", subtitle: "Update an existing logbook entry" },
  { match: (p) => p.startsWith("/cases"), title: "Case Logbook", subtitle: "Your logged operative cases" },
  { match: (p) => p.startsWith("/analytics"), title: "Analytics", subtitle: "Volume, distribution and autonomy trends" },
  { match: (p) => p.startsWith("/targets"), title: "Target Settings", subtitle: "Required case counts by category" },
  { match: (p) => p.startsWith("/ai-assistant"), title: "AI Study Assistant", subtitle: "Reflections, viva prep and case analysis" },
  { match: (p) => p.startsWith("/admin"), title: "Admin Panel", subtitle: "Consultant case audit and approvals" },
];

export function Navbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const pathname = usePathname() || "";
  const route = ROUTE_TITLES.find((entry) => entry.match(pathname));

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white/85 backdrop-blur-md transition-colors dark:border-slate-700 dark:bg-slate-800/85">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onOpenMobileNav && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMobileNav}
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Brand size="sm" className="md:hidden" />

          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
              {route?.title ?? "SurgLog"}
            </p>
            <p className="truncate text-xs leading-snug text-slate-500 dark:text-slate-400">
              {route?.subtitle ?? "Surgical case logbook"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
