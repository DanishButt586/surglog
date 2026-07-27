"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { AuthShell, IconInput } from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";

const SPECIALTIES = [
  "General Surgery",
  "Orthopedic Surgery",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Vascular Surgery",
  "Pediatric Surgery",
  "Urology",
  "Plastic & Reconstructive",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("General Surgery");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          specialty,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Ensure the profile row exists
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
      });

      // Seed initial target categories if the database trigger hasn't fired
      const defaultCategories = [
        { user_id: data.user.id, category: "Laparoscopic Cholecystectomy", required_count: 15 },
        { user_id: data.user.id, category: "Appendectomy", required_count: 10 },
        { user_id: data.user.id, category: "Colectomy", required_count: 6 },
        { user_id: data.user.id, category: "Inguinal Hernia Repair", required_count: 8 },
        { user_id: data.user.id, category: "Arteriovenous Fistula", required_count: 5 },
        { user_id: data.user.id, category: "Mastectomy", required_count: 4 },
        { user_id: data.user.id, category: "Thyroidectomy", required_count: 5 },
        { user_id: data.user.id, category: "Carotid Endarterectomy", required_count: 3 },
      ];

      await supabase.from("targets").upsert(defaultCategories, { onConflict: "user_id,category" });

      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Email-confirmation flows return no session — release the button rather
    // than leaving it spinning forever.
    setInfoMsg("Check your inbox to confirm your email address, then log in.");
    setLoading(false);
  };

  return (
    <AuthShell
      title="Create your SurgLog account"
      description="Join thousands of surgical trainees tracking case requirements"
      footer={
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
          >
            Log in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {errorMsg && <Alert tone="error" title={errorMsg} />}
        {infoMsg && <Alert tone="success" title={infoMsg} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name & Title" htmlFor="signup-name" required>
            <IconInput icon={User}>
              <Input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Dr. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </IconInput>
          </Field>

          <Field label="Hospital / Institutional Email" htmlFor="signup-email" required>
            <IconInput icon={Mail}>
              <Input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="j.doe@medical.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </IconInput>
          </Field>

          <Field label="Surgical Specialty" htmlFor="signup-specialty">
            <Select
              id="signup-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {SPECIALTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Create Password"
            htmlFor="signup-password"
            required
            hint="At least 6 characters."
          >
            <IconInput icon={Lock}>
              <Input
                id="signup-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
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
                Creating account…
              </>
            ) : (
              <>
                Create Account &amp; Start Logging
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
