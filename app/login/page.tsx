"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { AuthShell, IconInput } from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const inputClean = email.trim().toLowerCase();
    const passClean = password.trim();

    // Hardcoded admin shortcut (email: admin@surglog.com or admin, password: admin)
    if ((inputClean === "admin" || inputClean === "admin@surglog.com") && passClean === "admin") {
      const supabase = createClient();

      const { error: adminAuthError } = await supabase.auth.signInWithPassword({
        email: "admin@surglog.com",
        password: "adminpassword123",
      });

      if (adminAuthError) {
        // Auto-signup the admin account if it is not registered yet
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: "admin@surglog.com",
          password: "adminpassword123",
          options: {
            data: { full_name: "Program Director Admin" },
          },
        });

        if (!signUpError && signUpData.user) {
          await supabase
            .from("profiles")
            .upsert({ id: signUpData.user.id, full_name: "Program Director Admin", is_admin: true });
        }
      }

      router.push("/admin");
      router.refresh();
      return;
    }

    // Standard trainee login via Supabase
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin");
    setPassword("admin");
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Enter your credentials to access your surgical case logbook"
      footer={
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="rounded font-semibold text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
          >
            Sign up here
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {errorMsg && <Alert tone="error" title={errorMsg} />}

        {/* Demo credential helper */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/50">
          <div className="flex min-w-0 items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Admin login: <strong>admin</strong> / <strong>admin</strong>
            </span>
          </div>
          <Button variant="outline" size="xs" onClick={fillAdminCredentials}>
            Auto Fill
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email or Username" htmlFor="login-email" required>
            <IconInput icon={Mail}>
              <Input
                id="login-email"
                type="text"
                required
                autoComplete="username"
                placeholder="doctor@hospital.org or admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </IconInput>
          </Field>

          <Field
            label="Password"
            htmlFor="login-password"
            required
            labelAction={
              <Link
                href="/login"
                className="rounded text-xs font-medium text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
              >
                Forgot password?
              </Link>
            }
          >
            <IconInput icon={Lock}>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </IconInput>
          </Field>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Log In to Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
