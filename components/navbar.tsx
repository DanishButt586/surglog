"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileNav}
            className="md:hidden text-slate-600 dark:text-slate-300"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-8 rounded-lg bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">SurgLog</span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Surgical Resident Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">ACGME / RCS Requirement Tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Toggle Dark Mode"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400 transition-all" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300 transition-all" />
          )}
        </Button>

        {/* Quick Add Case Button */}
        <Link href="/cases/new">
          <Button variant="primary" size="sm" className="hidden sm:flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Log Case</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
