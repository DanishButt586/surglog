"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  X,
  Loader2,
  Sparkles,
  ClipboardList,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { INITIAL_CASES, INITIAL_CATEGORIES, SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { exportCasesToCSV, exportCasesToPDF } from "@/lib/export-utils";

export default function CaseListPage() {
  const [casesList, setCasesList] = useState<SurgicalCase[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Surgical Resident");
  const [userEmail, setUserEmail] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUserEmail(user.email || "");
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) setUserName(profile.full_name);
      }

      // Fetch cases
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        const mapped: SurgicalCase[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          procedureName: item.procedure_name,
          category: item.category,
          role: item.role,
          supervisorName: item.supervisor_name,
          hospitalWard: item.hospital_ward,
          complexity: item.complexity || "Medium",
          patientAge: item.patient_age || 0,
          patientGender: item.patient_gender || "Female",
          notes: item.notes || "",
        }));
        setCasesList(mapped);
      }

      // Fetch targets/categories
      const { data: targetsData } = await supabase
        .from("targets")
        .select("category")
        .eq("user_id", user.id);

      if (targetsData && targetsData.length > 0) {
        setCategoriesList(targetsData.map((t: any) => t.category));
      } else {
        setCategoriesList(INITIAL_CATEGORIES.map((c) => c.name));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSeedSampleCases = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const samples = INITIAL_CASES.map((c) => ({
        user_id: user.id,
        date: c.date,
        procedure_name: c.procedureName,
        category: c.category,
        role: c.role,
        supervisor_name: c.supervisorName,
        hospital_ward: c.hospitalWard,
        complexity: c.complexity,
        patient_age: c.patientAge,
        patient_gender: c.patientGender,
        notes: c.notes,
      }));

      await supabase.from("cases").insert(samples);
      await fetchCases();
    }
  };

  const handleDeleteCase = async (id: string) => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("cases").delete().eq("id", id);

    if (!error) {
      setCasesList((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleting(false);
    setDeleteTargetId(null);
  };

  // Filter cases logic against search, role, category, and date range
  const filteredCases = casesList.filter((c) => {
    const matchesSearch =
      c.procedureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalWard.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || c.role === roleFilter;
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && c.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && c.date <= endDate;
    }

    return matchesSearch && matchesRole && matchesCategory && matchesDate;
  });

  // Calculate Category Totals for PDF Summary
  const categoryTotals: Record<string, number> = {};
  filteredCases.forEach((c) => {
    categoryTotals[c.category] = (categoryTotals[c.category] || 0) + 1;
  });

  const handleExportCSV = () => {
    exportCasesToCSV(filteredCases, userName);
  };

  const handleExportPDF = () => {
    exportCasesToPDF(filteredCases, userName, userEmail, categoryTotals);
  };

  const roleBadges = {
    Performed: "teal",
    Assisted: "success",
    Observed: "warning",
  } as const;

  const complexityBadges = {
    Low: "default",
    Medium: "teal",
    High: "warning",
  } as const;

  const hasActiveFilters = searchQuery || roleFilter !== "All" || categoryFilter !== "All" || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Surgical Case Logbook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, filter, search, and export your logged operative cases from Supabase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredCases.length === 0}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={filteredCases.length === 0}
            className="gap-1.5 text-xs font-semibold border-teal-500 text-teal-700 dark:text-teal-300"
          >
            <FileText className="h-4 w-4" /> Export Board PDF
          </Button>

          {casesList.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedSampleCases}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-amber-500" /> Sample Cases
            </Button>
          )}

          <Link href="/cases/new">
            <Button variant="primary" size="sm" className="shadow-sm gap-1.5">
              <Plus className="h-4 w-4" /> Log Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input (4 cols) */}
            <div className="sm:col-span-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search procedure, supervisor, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter (2 cols) */}
            <div className="sm:col-span-2">
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Performed">Performed</option>
                <option value="Assisted">Assisted</option>
                <option value="Observed">Observed</option>
              </Select>
            </div>

            {/* Category Filter (3 cols) */}
            <div className="sm:col-span-3">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Procedure Categories</option>
                {categoriesList.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Range Start & End (3 cols) */}
            <div className="sm:col-span-3 flex items-center gap-2">
              <Input
                type="date"
                title="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs"
              />
              <span className="text-slate-400 text-xs">-</span>
              <Input
                type="date"
                title="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Showing {filteredCases.length} of {casesList.length} total cases</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("All");
                  setCategoryFilter("All");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <X className="h-3 w-3" /> Clear Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Fetching your logged surgical cases from Supabase...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Procedure & Category</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Complexity</th>
                  <th className="p-4">Supervisor & Hospital</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCases.length > 0 ? (
                  filteredCases.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-4 pl-6 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{item.date}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.procedureName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={roleBadges[item.role] || "default"}>{item.role}</Badge>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={complexityBadges[item.complexity] || "default"}>
                          {item.complexity}
                        </Badge>
                      </td>

                      <td className="p-4 max-w-xs truncate">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.supervisorName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.hospitalWard}
                        </p>
                      </td>

                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/cases/${item.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                              aria-label="Edit Case"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTargetId(item.id)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            aria-label="Delete Case"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                          {hasActiveFilters ? "No cases match your filters" : "No cases logged yet"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {hasActiveFilters
                            ? "Try clearing or adjusting your search criteria and date range."
                            : "Add your first surgical procedure entry to begin tracking targets and analytics."}
                        </p>

                        {!hasActiveFilters && (
                          <div className="flex items-center gap-3 pt-2">
                            <Link href="/cases/new">
                              <Button variant="primary" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Your First Case
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleSeedSampleCases}>
                              <Sparkles className="h-4 w-4 mr-1 text-teal-600 dark:text-teal-400" />
                              Load Sample Cases
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Delete Modal Confirmation */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Case Entry</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this case from your Supabase logbook? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" disabled={deleting} onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={() => handleDeleteCase(deleteTargetId)}
              >
                {deleting ? "Deleting..." : "Delete Case"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
