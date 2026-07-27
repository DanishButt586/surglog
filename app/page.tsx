"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Stethoscope,
  Sun,
  Moon,
  CheckCircle2,
  BarChart3,
  Bot,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            SurgLog
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle Dark Mode"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </Button>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-6 mx-auto">
          <ShieldCheck className="h-4 w-4" />
          <span>Designed for Surgical Residents & Medical Trainees</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Surgical Case Logging, <br className="hidden sm:inline" />
          <span className="text-teal-600 dark:text-teal-400">Streamlined & Smart</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Log operative cases effortlessly, monitor progress against ACGME & RCS case-count targets in real-time, and get AI-assisted surgical study notes when preparing for board exams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 shadow-md">
              Explore Demo Dashboard
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <Card className="hover:border-teal-500/50 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <CardTitle>Case-Count Target Tracker</CardTitle>
              <CardDescription>
                Track requirements per surgical procedure category (e.g. Appendectomy 8/10, Cholecystectomy 15/15) with automatic visual status indicators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-teal-500/50 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle>Visual Analytics</CardTitle>
              <CardDescription>
                Gain insights into your surgical experience with bar charts by category, monthly log trends, and role breakdown (Observed, Assisted, Performed).
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-teal-500/50 transition-all">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2">
                <Bot className="h-5 w-5" />
              </div>
              <CardTitle>AI Surgical Study Assistant</CardTitle>
              <CardDescription>
                Review anatomical landmarks, surgical steps, suture choices, and complication management with an integrated AI tutor.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 SurgLog. Clinical Surgical Logbook Tracker for Trainees.</p>
      </footer>
    </div>
  );
}
