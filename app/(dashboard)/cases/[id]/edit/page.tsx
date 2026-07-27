"use client";

import { useState, useEffect, use } from "react";
import { CaseForm } from "@/components/case-form";
import { SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/ui/states";
import { Card } from "@/components/ui/card";

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
    // Same max-width as the form it replaces, so the card does not jump
    // sideways or resize when the data arrives.
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <LoadingState label="Loading case details…" minHeight="min-h-[420px]" />
        </Card>
      </div>
    );
  }

  return <CaseForm initialData={caseData || { id: resolvedParams.id }} isEdit={true} />;
}
