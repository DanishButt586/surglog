import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Stethoscope,
  ClipboardList,
  Target,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Header / Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            SurgLog
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="shadow-xs">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Designed for Surgical Trainees, Residents & Fellows</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl">
          Log operative cases. <br />
          <span className="text-teal-600 dark:text-teal-400">Track audit targets.</span> Ace surgical exams.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
          The ultimate medical logbook tracker. Effortlessly log procedures, monitor ACGME/Royal College requirements, and get instant AI-assisted study help.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="shadow-md text-base px-8 gap-2">
              <span>Start Free Logbook</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-base px-8">
              Sign In to Your Account
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left w-full">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Seamless Case Logging</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Log patient age, procedure category, surgical role (Observed/Assisted/Performed), and supervisor names in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Target Requirement Progress</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Set required procedure counts for ACGME or college audits and watch your visual progress bars automatically update.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Surgical Study Assistant</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate instant surgical steps, anatomical landmarks, complications, and board-style exam questions for any procedure.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SurgLog — Surgical Case Logbook Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
