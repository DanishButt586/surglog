import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";
import { Card } from "@/components/ui/card";
import { ClipboardList, Target, Sparkles, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardList,
    tone: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    title: "Seamless Case Logging",
    body: "Log patient age, procedure category, surgical role (Observed/Assisted/Performed), and supervisor names in seconds.",
  },
  {
    icon: Target,
    tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    title: "Target Requirement Progress",
    body: "Set required procedure counts for ACGME or college audits and watch your visual progress bars update automatically.",
  },
  {
    icon: Sparkles,
    tone: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    title: "AI Surgical Study Assistant",
    body: "Generate instant surgical steps, anatomical landmarks, complications, and board-style exam questions for any procedure.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      {/* Header — shares the page container so the logo lines up with the hero */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Brand size="sm" />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            {/* "Log In" folds into the hero CTAs below sm — at 375px all four
                controls could not fit on one row without overflowing. */}
            <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
              Log In
            </Link>
            <Link href="/signup" className={buttonStyles({ size: "sm" })}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
          <span>Designed for Surgical Trainees, Residents &amp; Fellows</span>
        </div>

        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Log operative cases.{" "}
          <span className="text-teal-600 dark:text-teal-400">Track audit targets.</span> Ace surgical
          exams.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
          The ultimate medical logbook tracker. Effortlessly log procedures, monitor ACGME/Royal
          College requirements, and get instant AI-assisted study help.
        </p>

        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <Link href="/signup" className={buttonStyles({ size: "lg", className: "px-8 shadow-md" })}>
            <span>Start Free Logbook</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={buttonStyles({ variant: "outline", size: "lg", className: "px-8" })}
          >
            Sign In to Your Account
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 text-left sm:gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, tone, title, body }) => (
            <Card key={title} className="p-5 sm:p-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {body}
              </p>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 dark:border-slate-700">
        <p className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          © {new Date().getFullYear()} SurgLog — Surgical Case Logbook Tracker. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
