"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * The single theme toggle for the whole app. The auth pages used to hand-roll
 * their own copy (reading `theme` rather than `resolvedTheme`, which showed the
 * wrong icon on first paint) — they now use this.
 *
 * The icon slot keeps its 20px box before mount so swapping icons after
 * hydration never nudges the surrounding row.
 */
export function ThemeToggle({
  className,
  size = "icon",
}: {
  className?: string;
  size?: ButtonProps["size"];
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <span className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
