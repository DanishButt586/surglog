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
  Sparkles,
  ClipboardList,
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { RoleBadge, ApprovalBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { TableWrapper, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui/table";
import { LoadingState, EmptyState, Spinner } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { INITIAL_CASES, INITIAL_CATEGORIES, SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { exportCasesToCSV, exportCasesToPDF } from "@/lib/export-utils";

export default function CaseListPage() {
  const [casesList, setCasesList] = useState<SurgicalCase[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Surgical Resident");
  const [userEmail, setUserEmail] = useState("");

  // Filters
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
          approvalStatus: item.approval_status || "pending",
          adminComment: item.admin_comment || "",
        }));
        setCasesList(mapped);
      }

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
    setError(null);
    try {
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
          approval_status: c.approvalStatus || "pending",
          admin_comment: c.adminComment || "",
        }));

        const { error: insertError } = await supabase.from("cases").insert(samples);
        if (insertError) throw insertError;
        await fetchCases();
      }
    } catch (err: any) {
      setError(err.message || "Failed to load sample cases.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCase = async (id: string) => {
    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("cases").delete().eq("id", id);

      if (error) throw error;
      setCasesList((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete case.");
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const filteredCases = casesList.filter((c) => {
    const matchesSearch =
      c.procedureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalWard.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || c.role === roleFilter;
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;

    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && c.date >= startDate;
    if (endDate) matchesDate = matchesDate && c.date <= endDate;

    return matchesSearch && matchesRole && matchesCategory && matchesDate;
  });

  const categoryTotals: Record<string, number> = {};
  filteredCases.forEach((c) => {
    categoryTotals[c.category] = (categoryTotals[c.category] || 0) + 1;
  });

  const handleExportCSV = () => exportCasesToCSV(filteredCases, userName);
  const handleExportPDF = () => exportCasesToPDF(filteredCases, userName, userEmail, categoryTotals);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    roleFilter !== "All" ||
    categoryFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("All");
    setCategoryFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const emptyState = (
    <EmptyState
      icon={ClipboardList}
      title={hasActiveFilters ? "No cases match your filters" : "No cases logged yet"}
      description={
        hasActiveFilters
          ? "Try clearing or adjusting your search criteria and date range."
          : "Add your first surgical procedure entry to begin tracking targets and analytics."
      }
      minHeight="min-h-[280px]"
      action={
        hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        ) : (
          <>
            <Link href="/cases/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="h-4 w-4" />
              Add Your First Case
            </Link>
            <Button variant="outline" size="sm" onClick={handleSeedSampleCases}>
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Load Sample Cases
            </Button>
          </>
        )
      }
    />
  );

  const consultantNote = (comment: string) => (
    <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        <strong>Consultant note:</strong> {comment}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surgical Case Logbook"
        description="View, filter, search, and export your logged operative cases with consultant audit status."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredCases.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={filteredCases.length === 0}
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>

            <Link href="/cases/new" className={buttonStyles({ size: "sm" })}>
              <Plus className="h-4 w-4" />
              Log Case
            </Link>
          </>
        }
      />

      {error && (
        <Alert tone="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 pt-5 sm:pt-6">
          {/* 6-column track at xl keeps every control usable: search and the
              date pair take two columns each, so a native date input never
              collapses below its ~150px intrinsic width. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Field label="Search" htmlFor="case-search" className="sm:col-span-2">
              <div className="relative">
                {/* inset-y-0 + flex centers the glyph against the 40px control
                    height regardless of icon size. */}
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  id="case-search"
                  type="search"
                  placeholder="Procedure, supervisor, or hospital…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Role" htmlFor="case-role">
              <Select id="case-role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Performed">Performed</option>
                <option value="Assisted">Assisted</option>
                <option value="Observed">Observed</option>
              </Select>
            </Field>

            <Field label="Category" htmlFor="case-category">
              <Select
                id="case-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categoriesList.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <Field label="From" htmlFor="case-start">
                <Input
                  id="case-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>

              <Field label="To" htmlFor="case-end">
                <Input
                  id="case-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span>
                Showing {filteredCases.length} of {casesList.length} total cases
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1 rounded font-medium text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
              >
                <X className="h-3 w-3" /> Clear Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case data */}
      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="Fetching your logged surgical cases…" minHeight="min-h-[280px]" />
        ) : filteredCases.length === 0 ? (
          emptyState
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block">
              <TableWrapper minWidth="min-w-[880px]">
                <TableHead>
                  <tr>
                    <TH>Date</TH>
                    <TH>Procedure &amp; Category</TH>
                    <TH>Role &amp; Status</TH>
                    <TH>Supervisor &amp; Hospital</TH>
                    <TH align="right">Actions</TH>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredCases.map((item) => (
                    <TableRow key={item.id}>
                      <TD className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                          {item.date}
                        </span>
                      </TD>

                      <TD>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.procedureName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {item.category}
                        </p>
                        {item.adminComment && (
                          <div className="max-w-sm">{consultantNote(item.adminComment)}</div>
                        )}
                      </TD>

                      <TD className="whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1.5">
                          <RoleBadge role={item.role} />
                          <ApprovalBadge status={item.approvalStatus} />
                        </div>
                      </TD>

                      <TD className="max-w-[16rem]">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {item.supervisorName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.hospitalWard}
                        </p>
                      </TD>

                      <TD align="right" className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/cases/${item.id}/edit`}
                            aria-label={`Edit ${item.procedureName}`}
                            className={buttonStyles({
                              variant: "ghost",
                              size: "icon-sm",
                              className: "hover:text-teal-600 dark:hover:text-teal-400",
                            })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTargetId(item.id)}
                            className="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            aria-label={`Delete ${item.procedureName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TD>
                    </TableRow>
                  ))}
                </TableBody>
              </TableWrapper>
            </div>

            {/* Mobile card list — same data, no sideways scrolling */}
            <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-700/60">
              {filteredCases.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.procedureName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/cases/${item.id}/edit`}
                        aria-label={`Edit ${item.procedureName}`}
                        className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTargetId(item.id)}
                        className="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        aria-label={`Delete ${item.procedureName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <RoleBadge role={item.role} />
                    <ApprovalBadge status={item.approvalStatus} />
                  </div>

                  <dl className="mt-3 space-y-1 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-slate-500 dark:text-slate-400">Date</dt>
                      <dd className="min-w-0 text-slate-700 dark:text-slate-300">{item.date}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-slate-500 dark:text-slate-400">Supervisor</dt>
                      <dd className="min-w-0 text-slate-700 dark:text-slate-300">
                        {item.supervisorName}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-slate-500 dark:text-slate-400">Location</dt>
                      <dd className="min-w-0 text-slate-700 dark:text-slate-300">
                        {item.hospitalWard}
                      </dd>
                    </div>
                  </dl>

                  {item.adminComment && consultantNote(item.adminComment)}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTargetId)}
        onClose={() => !deleting && setDeleteTargetId(null)}
        labelledBy="delete-case-title"
        describedBy="delete-case-description"
      >
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h2
              id="delete-case-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Delete Case Entry
            </h2>
          </div>
          <p
            id="delete-case-description"
            className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Are you sure you want to remove this case from your logbook? This action cannot be
            undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => deleteTargetId && handleDeleteCase(deleteTargetId)}
            >
              {deleting ? (
                <>
                  <Spinner className="h-4 w-4 text-current" />
                  Deleting…
                </>
              ) : (
                "Delete Case"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
