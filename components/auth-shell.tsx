import * as React from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Shared chrome for /login and /signup — identical header height, gutters, card
 * width and footer treatment on both pages.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900"
          >
            <Brand size="sm" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1.5 text-center">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="justify-center border-t border-slate-200 pt-5 dark:border-slate-700">
            {footer}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/**
 * Input with a leading icon. The icon is vertically centered against the 40px
 * control height with `inset-y-0 + flex`, rather than a hand-tuned `top-*`
 * value that only happened to line up for one icon size.
 */
export function IconInput({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </div>
  );
}
