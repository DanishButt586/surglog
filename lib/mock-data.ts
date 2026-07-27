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
  },
  {
    id: "case-106",
    date: "2026-07-08",
    procedureName: "Modified Radical Mastectomy",
    category: "Mastectomy",
    role: "Assisted",
    supervisorName: "Dr. Rachel Adams",
    hospitalWard: "City General Hospital / OR 5",
    complexity: "Medium",
    patientAge: 62,
    patientGender: "Female",
    notes: "Axillary node dissection level I and II performed. Drains placed.",
  },
  {
    id: "case-107",
    date: "2026-07-03",
    procedureName: "Radiocephalic AV Fistula Creation",
    category: "Arteriovenous Fistula",
    role: "Performed",
    supervisorName: "Dr. David Thorne",
    hospitalWard: "University Medical Center / Vascular Suite",
    complexity: "Medium",
    patientAge: 49,
    patientGender: "Male",
    notes: "End-to-side anastomosis with 6-0 Prolene. Strong thrill palpable post-op.",
  },
];

export const MONTHLY_TREND_DATA = [
  { month: "Feb", cases: 5 },
  { month: "Mar", cases: 7 },
  { month: "Apr", cases: 9 },
  { month: "May", cases: 11 },
  { month: "Jun", cases: 14 },
  { month: "Jul", cases: 12 },
];

export const ROLE_BREAKDOWN_DATA = [
  { name: "Performed", value: 22, color: "#0D9488" }, // Teal
  { name: "Assisted", value: 18, color: "#10B981" },  // Emerald
  { name: "Observed", value: 8, color: "#F59E0B" },   // Amber
];

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const INITIAL_CHAT_SESSIONS = [
  { id: "chat-1", title: "Laparoscopic Cholecystectomy Steps", date: "Today" },
  { id: "chat-2", title: "Inguinal Hernia Mesh Types", date: "Yesterday" },
  { id: "chat-3", title: "Thyroidectomy Complications & RLN", date: "3 days ago" },
];

export const SUGGESTED_PROMPTS = [
  "What is the Critical View of Safety in Laparoscopic Cholecystectomy?",
  "Compare Lichtenstein vs TAPP vs TEP hernia repair techniques.",
  "What are the immediate surgical management steps for postoperative neck hematoma after Thyroidectomy?",
  "Review the vascular anatomy of the mesenteric arterial arcades for Colectomy.",
];
