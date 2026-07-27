"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle Light and Dark Mode"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5 text-amber-400 transition-all" />
        ) : (
          <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300 transition-all" />
        )
      ) : (
        <div className="h-5 w-5" />
      )}
    </Button>
  );
}
