"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SurgicalCase, INITIAL_CATEGORIES } from "@/lib/mock-data";
import { Save, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function CaseForm({ initialData, isEdit = false }: { initialData?: Partial<SurgicalCase>; isEdit?: boolean }) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [procedureName, setProcedureName] = useState(initialData?.procedureName || "");
  const [category, setCategory] = useState(initialData?.category || INITIAL_CATEGORIES[0].name);
  const [role, setRole] = useState<"Observed" | "Assisted" | "Performed">(initialData?.role || "Performed");
  const [supervisorName, setSupervisorName] = useState(initialData?.supervisorName || "");
  const [hospitalWard, setHospitalWard] = useState(initialData?.hospitalWard || "");
  const [complexity, setComplexity] = useState<"Low" | "Medium" | "High">(initialData?.complexity || "Medium");
  const [patientAge, setPatientAge] = useState<number | "">(initialData?.patientAge || "");
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">(initialData?.patientGender || "Female");
  const [notes, setNotes] = useState(initialData?.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("You must be logged in to save a case.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      date,
      procedure_name: procedureName,
      category,
      role,
      supervisor_name: supervisorName,
      hospital_ward: hospitalWard,
      complexity,
      patient_age: patientAge === "" ? null : Number(patientAge),
      patient_gender: patientGender,
      notes,
    };

    let error = null;

    if (isEdit && initialData?.id) {
      const res = await supabase.from("cases").update(payload).eq("id", initialData.id);
      error = res.error;
    } else {
      const res = await supabase.from("cases").insert(payload);
      error = res.error;
    }

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccessMsg(true);
      setTimeout(() => {
        router.push("/cases");
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/cases">
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" />
            Back to Case Logbook
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {isEdit ? "Edit Surgical Case Entry" : "Log New Surgical Case"}
          </CardTitle>
          <CardDescription>
            Record comprehensive procedure details for your accredited surgical logbook.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-sm">
                  {isEdit ? "Case updated successfully!" : "New case logged successfully!"}
                </p>
                <p className="text-xs">Redirecting to case logbook...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid 1: Date & Procedure Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Date of Surgery <span className="text-rose-500">*</span>
                </label>
                <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Procedure Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Laparoscopic Cholecystectomy"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                />
              </div>
            </div>

            {/* Grid 2: Category & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Procedure Category <span className="text-rose-500">*</span>
                </label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Surgical Role <span className="text-rose-500">*</span>
                </label>
                <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="Observed">Observed</option>
                  <option value="Assisted">Assisted</option>
                  <option value="Performed">Performed (Primary Surgeon)</option>
                </Select>
              </div>
            </div>

            {/* Grid 3: Consultant & Hospital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Consultant / Supervisor Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins, FACS"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hospital / Ward / OR <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. St. Jude Memorial Hospital / OR 4"
                  value={hospitalWard}
                  onChange={(e) => setHospitalWard(e.target.value)}
                />
              </div>
            </div>

            {/* Grid 4: Complexity, Patient Age, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Complexity</label>
                <Select value={complexity} onChange={(e) => setComplexity(e.target.value as any)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Patient Age</label>
                <Input
                  type="number"
                  placeholder="e.g. 45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Patient Gender</label>
                <Select value={patientGender} onChange={(e) => setPatientGender(e.target.value as any)}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>

            {/* Grid 5: Operative Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Operative & Reflection Notes
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Key operative steps, anatomical landmarks, suture material, or intraoperative findings..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Link href="/cases">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={loading} className="shadow-sm gap-1.5">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? "Save Changes" : "Log Case Entry"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
