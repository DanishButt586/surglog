"use client";

import { CaseForm } from "@/components/case-form";
import { INITIAL_CASES } from "@/lib/mock-data";
import { use } from "react";

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const existingCase = INITIAL_CASES.find((c) => c.id === resolvedParams.id) || INITIAL_CASES[0];

  return <CaseForm initialData={existingCase} isEdit={true} />;
}
