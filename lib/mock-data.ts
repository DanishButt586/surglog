export interface SurgicalCase {
  id: string;
  date: string;
  procedureName: string;
  category: string;
  role: "Observed" | "Assisted" | "Performed";
  supervisorName: string;
  hospitalWard: string;
  complexity: "Low" | "Medium" | "High";
  patientAge: number;
  patientGender: "Male" | "Female" | "Other";
  notes?: string;
  approvalStatus?: "pending" | "approved" | "needs_review";
  adminComment?: string;
}

export interface CategoryTarget {
  id: string;
  name: string;
  requiredCount: number;
  currentCount: number;
}

export const INITIAL_CATEGORIES: CategoryTarget[] = [
  { id: "cat-1", name: "Laparoscopic Cholecystectomy", requiredCount: 15, currentCount: 15 },
  { id: "cat-2", name: "Appendectomy", requiredCount: 10, currentCount: 8 },
  { id: "cat-3", name: "Colectomy", requiredCount: 6, currentCount: 6 },
  { id: "cat-4", name: "Inguinal Hernia Repair", requiredCount: 8, currentCount: 4 },
  { id: "cat-5", name: "Arteriovenous Fistula", requiredCount: 5, currentCount: 5 },
  { id: "cat-6", name: "Mastectomy", requiredCount: 4, currentCount: 3 },
  { id: "cat-7", name: "Thyroidectomy", requiredCount: 5, currentCount: 2 },
  { id: "cat-8", name: "Carotid Endarterectomy", requiredCount: 3, currentCount: 1 },
];

export const INITIAL_CASES: SurgicalCase[] = [
  {
    id: "case-101",
    date: "2026-07-24",
    procedureName: "Laparoscopic Cholecystectomy",
    category: "Laparoscopic Cholecystectomy",
    role: "Performed",
    supervisorName: "Dr. Sarah Jenkins, FACS",
    hospitalWard: "St. Jude Memorial Hospital / OR 4",
    complexity: "Medium",
    patientAge: 46,
    patientGender: "Female",
    notes: "Identified Critical View of Safety successfully. Single clip placed on cystic duct.",
    approvalStatus: "approved",
    adminComment: "Excellent documentation of CVS.",
  },
  {
    id: "case-102",
    date: "2026-07-22",
    procedureName: "Emergency Laparoscopic Appendectomy",
    category: "Appendectomy",
    role: "Performed",
    supervisorName: "Dr. Robert Vance",
    hospitalWard: "City General Hospital / OR 2",
    complexity: "Low",
    patientAge: 24,
    patientGender: "Male",
    notes: "Acute suppurative appendicitis. Mesoappendix skeletonized with Harmonic scalpel.",
    approvalStatus: "approved",
  },
  {
    id: "case-103",
    date: "2026-07-19",
    procedureName: "Right Inguinal Hernia Repair (Lichtenstein)",
    category: "Inguinal Hernia Repair",
    role: "Assisted",
    supervisorName: "Dr. Michael Chen",
    hospitalWard: "St. Jude Memorial Hospital / OR 1",
    complexity: "Medium",
    patientAge: 58,
    patientGender: "Male",
    notes: "Polypropylene mesh placed & secured to pubic tubercle with 2-0 Prolene.",
    approvalStatus: "pending",
  },
  {
    id: "case-104",
    date: "2026-07-15",
    procedureName: "Total Thyroidectomy",
    category: "Thyroidectomy",
    role: "Observed",
    supervisorName: "Dr. Elena Rostova",
    hospitalWard: "University Medical Center / OR 6",
    complexity: "High",
    patientAge: 51,
    patientGender: "Female",
    notes: "Recurrent laryngeal nerve dissected carefully with nerve monitor.",
    approvalStatus: "needs_review",
    adminComment: "Please add details on parathyroid gland preservation.",
  },
  {
    id: "case-105",
    date: "2026-07-11",
    procedureName: "Left Hemicolectomy",
    category: "Colectomy",
    role: "Assisted",
    supervisorName: "Dr. Sarah Jenkins, FACS",
    hospitalWard: "St. Jude Memorial Hospital / OR 3",
    complexity: "High",
    patientAge: 67,
    patientGender: "Male",
    notes: "Stapled side-to-side anastomosis. Good tissue perfusion verified with ICG.",
    approvalStatus: "approved",
  },
];
