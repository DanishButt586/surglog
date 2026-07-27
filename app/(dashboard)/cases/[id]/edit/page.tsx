"use client";

import { useState, useEffect, use } from "react";
import { CaseForm } from "@/components/case-form";
import { SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [caseData, setCaseData] = useState<Partial<SurgicalCase> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (data && !error) {
        setCaseData({
          id: data.id,
          date: data.date,
          procedureName: data.procedure_name,
          category: data.category,
          role: data.role,
          supervisorName: data.supervisor_name,
          hospitalWard: data.hospital_ward,
          complexity: data.complexity,
          patientAge: data.patient_age,
          patientGender: data.patient_gender,
          notes: data.notes,
        });
      }
      setLoading(false);
    }
    fetchCase();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
        <p className="text-sm font-medium">Loading case details from Supabase...</p>
      </div>
    );
  }

  return <CaseForm initialData={caseData || { id: resolvedParams.id }} isEdit={true} />;
}
