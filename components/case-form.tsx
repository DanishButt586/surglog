"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SurgicalCase, INITIAL_CATEGORIES } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export function CaseForm({
  initialData,
  isEdit = false,
}: {
  initialData?: Partial<SurgicalCase>;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [procedureName, setProcedureName] = useState(initialData?.procedureName || "");
  const [category, setCategory] = useState(initialData?.category || INITIAL_CATEGORIES[0].name);
  const [role, setRole] = useState<"Observed" | "Assisted" | "Performed">(
    initialData?.role || "Performed"
  );
  const [supervisorName, setSupervisorName] = useState(initialData?.supervisorName || "");
  const [hospitalWard, setHospitalWard] = useState(initialData?.hospitalWard || "");
  const [complexity, setComplexity] = useState<"Low" | "Medium" | "High">(
    initialData?.complexity || "Medium"
  );
  const [patientAge, setPatientAge] = useState<number | "">(initialData?.patientAge || "");
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">(
    initialData?.patientGender || "Female"
  );
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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/cases"
        className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Case Logbook
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Surgical Case Entry" : "Log New Surgical Case"}</CardTitle>
          <CardDescription>
            Record comprehensive procedure details for your accredited surgical logbook.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorMsg && <Alert tone="error" title="Could not save this case">{errorMsg}</Alert>}

          {successMsg && (
            <Alert
              tone="success"
              title={isEdit ? "Case updated successfully" : "New case logged successfully"}
            >
              Redirecting to your case logbook…
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Date of Surgery" htmlFor="case-date" required>
                <Input
                  id="case-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>

              <Field label="Procedure Name" htmlFor="case-procedure" required>
                <Input
                  id="case-procedure"
                  type="text"
                  required
                  placeholder="e.g. Laparoscopic Cholecystectomy"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Procedure Category" htmlFor="case-category-select" required>
                <Select
                  id="case-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Surgical Role" htmlFor="case-role-select" required>
                <Select
                  id="case-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                >
                  <option value="Observed">Observed</option>
                  <option value="Assisted">Assisted</option>
                  <option value="Performed">Performed (Primary Surgeon)</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Consultant / Supervisor Name" htmlFor="case-supervisor" required>
                <Input
                  id="case-supervisor"
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins, FACS"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                />
              </Field>

              <Field label="Hospital / Ward / OR" htmlFor="case-hospital" required>
                <Input
                  id="case-hospital"
                  type="text"
                  required
                  placeholder="e.g. St. Jude Memorial Hospital / OR 4"
                  value={hospitalWard}
                  onChange={(e) => setHospitalWard(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Complexity" htmlFor="case-complexity">
                <Select
                  id="case-complexity"
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as typeof complexity)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </Field>

              <Field label="Patient Age" htmlFor="case-age">
                <Input
                  id="case-age"
                  type="number"
                  min={0}
                  max={130}
                  placeholder="e.g. 45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>

              <Field label="Patient Gender" htmlFor="case-gender">
                <Select
                  id="case-gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as typeof patientGender)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
            </div>

            <Field label="Operative & Reflection Notes" htmlFor="case-notes">
              <Textarea
                id="case-notes"
                rows={4}
                placeholder="Key operative steps, anatomical landmarks, suture material, or intraoperative findings…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
              <Link href="/cases" className={buttonStyles({ variant: "outline", size: "md" })}>
                Cancel
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
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
