import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SurgicalCase } from "@/lib/mock-data";

export function exportCasesToCSV(cases: SurgicalCase[], userName: string = "Surgical Resident") {
  const headers = [
    "Date",
    "Procedure Name",
    "Category",
    "Role",
    "Complexity",
    "Supervisor/Consultant",
    "Hospital/Ward",
    "Patient Age",
    "Patient Gender",
    "Notes",
  ];

  const rows = cases.map((c) => [
    `"${c.date || ""}"`,
    `"${(c.procedureName || "").replace(/"/g, '""')}"`,
    `"${(c.category || "").replace(/"/g, '""')}"`,
    `"${c.role || ""}"`,
    `"${c.complexity || ""}"`,
    `"${(c.supervisorName || "").replace(/"/g, '""')}"`,
    `"${(c.hospitalWard || "").replace(/"/g, '""')}"`,
    `"${c.patientAge || ""}"`,
    `"${c.patientGender || ""}"`,
    `"${(c.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const sanitizedName = userName.replace(/\s+/g, "_").toLowerCase();
  link.setAttribute("download", `surglog_cases_${sanitizedName}_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCasesToPDF(
  cases: SurgicalCase[],
  userName: string = "Dr. Surgical Resident",
  userEmail: string = "",
  categoryTotals: Record<string, number> = {}
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const exportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header Banner
  doc.setFillColor(13, 148, 136); // Teal-600 #0D9488
  doc.rect(0, 0, 297, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SurgLog — Official Surgical Case Logbook Report", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${exportDate}`, 283, 15, { align: "right" });

  // Student Profile Info Box
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Trainee Name: ${userName}`, 14, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Email / ID: ${userEmail || "Registered Trainee"}`, 14, 38);
  doc.text(`Total Logged Cases: ${cases.length}`, 14, 43);

  // Summary Category Totals Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Category Volume Summary (Board Audit)", 14, 52);

  const categoryEntries = Object.entries(categoryTotals);
  const summaryRows = categoryEntries.map(([cat, count]) => [cat, count.toString()]);

  if (summaryRows.length > 0) {
    autoTable(doc, {
      startY: 55,
      head: [["Surgery Category", "Cases Logged"]],
      body: summaryRows,
      theme: "grid",
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
      tableWidth: 120,
    });
  }

  // Full Case Log Table
  const startYForMainTable = summaryRows.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 55;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Complete Operative Logbook Entries", 14, startYForMainTable - 3);

  const tableBody = cases.map((c) => [
    c.date || "-",
    c.procedureName || "-",
    c.category || "-",
    c.role || "-",
    c.complexity || "-",
    c.supervisorName || "-",
    c.hospitalWard || "-",
  ]);

  autoTable(doc, {
    startY: startYForMainTable,
    head: [["Date", "Procedure Name", "Category", "Role", "Complexity", "Supervisor / Consultant", "Hospital / Ward"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14, bottom: 15 },
  });

  const sanitizedName = userName.replace(/\s+/g, "_").toLowerCase();
  doc.save(`SurgLog_Report_${sanitizedName}_${new Date().toISOString().substring(0, 10)}.pdf`);
}
