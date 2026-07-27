"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Stethoscope, Sun, Moon, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("alex.reed@hospital.org");
  const [password, setPassword] = useState("••••••••••••");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shadow-md">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">SurgLog</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-slate-600 dark:text-slate-300"
          aria-label="Toggle Dark Mode"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </Button>
      </header>

      {/* Login Card Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your surgical case logbook</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hospital / University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="doctor@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <a href="#" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full h-11 text-base shadow-sm">
                Log In to Dashboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Sign up here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
