"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  Save,
  Users,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { RoleBadge, ComplexityBadge, ApprovalBadge } from "@/components/ui/status-badge";
import { TableWrapper, TableHead, TableBody, TableRow, TH, TD } from "@/components/ui/table";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/page-header";
import { SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

interface TraineeSummary {
  id: string;
  fullName: string;
  totalCases: number;
  lastActivity: string;
  categoryBreakdown: Record<string, number>;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [trainees, setTrainees] = useState<TraineeSummary[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeSummary | null>(null);
  const [traineeCases, setTraineeCases] = useState<SurgicalCase[]>([]);

  const [traineeSearch, setTraineeSearch] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editingComments, setEditingComments] = useState<Record<string, string>>({});
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function initAdmin() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.is_admin) {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, created_at");

      const { data: casesData } = await supabase
        .from("cases")
        .select("*")
        .order("date", { ascending: false });

      if (profilesData) {
        const summaries: TraineeSummary[] = profilesData.map((p: any) => {
          const userCases = casesData?.filter((c: any) => c.user_id === p.id) || [];
          const catMap: Record<string, number> = {};
          userCases.forEach((c: any) => {
            catMap[c.category] = (catMap[c.category] || 0) + 1;
          });

          const lastCaseDate =
            userCases.length > 0
              ? userCases[0].date
              : p.created_at?.substring(0, 10) || "No activity";

          return {
            id: p.id,
            fullName: p.full_name || "Trainee",
            totalCases: userCases.length,
            lastActivity: lastCaseDate,
            categoryBreakdown: catMap,
          };
        });

        setTrainees(summaries);
      }
      setLoading(false);
    }

    initAdmin();
  }, [router]);

  const loadTraineeCases = async (trainee: TraineeSummary) => {
    setSelectedTrainee(trainee);
    setTraineeCases([]);
    setCasesLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", trainee.id)
      .order("date", { ascending: false });

    if (data) {
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
      setTraineeCases(mapped);

      const initialComments: Record<string, string> = {};
      mapped.forEach((c) => {
        initialComments[c.id] = c.adminComment || "";
      });
      setEditingComments(initialComments);
    }
    setCasesLoading(false);
  };

  const handleUpdateStatus = async (
    caseId: string,
    newStatus: "pending" | "approved" | "needs_review"
  ) => {
    setSavingCaseId(caseId);
    const supabase = createClient();
    const currentComment = editingComments[caseId] || "";

    const { error } = await supabase
      .from("cases")
      .update({ approval_status: newStatus, admin_comment: currentComment })
      .eq("id", caseId);

    if (!error) {
      setTraineeCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, approvalStatus: newStatus, adminComment: currentComment } : c
        )
      );
      const label =
        newStatus === "needs_review" ? "Needs Review" : newStatus === "approved" ? "Approved" : "Pending";
      setToastMessage(`Review status updated to “${label}”.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setSavingCaseId(null);
  };

  const handleSaveComment = async (caseId: string) => {
    setSavingCaseId(caseId);
    const supabase = createClient();
    const currentCase = traineeCases.find((c) => c.id === caseId);
    const commentToSave = editingComments[caseId] || "";

    const { error } = await supabase
      .from("cases")
      .update({
        admin_comment: commentToSave,
        approval_status: currentCase?.approvalStatus || "pending",
      })
      .eq("id", caseId);

    if (!error) {
      setTraineeCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, adminComment: commentToSave } : c))
      );
      setToastMessage("Consultant feedback saved.");
      setTimeout(() => setToastMessage(null), 3000);
    }
    setSavingCaseId(null);
  };

  const filteredTrainees = trainees.filter((t) =>
    t.fullName.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const filteredCases = traineeCases.filter((c) => {
    const matchesSearch =
      c.procedureName.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.supervisorName.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.hospitalWard.toLowerCase().includes(caseSearch.toLowerCase());

    const matchesRole = roleFilter === "All" || c.role === roleFilter;

    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && c.date >= startDate;
    if (endDate) matchesDate = matchesDate && c.date <= endDate;

    return matchesSearch && matchesRole && matchesDate;
  });

  if (loading) {
    return (
      <Card>
        <LoadingState
          label="Verifying admin privileges & fetching trainee logbooks…"
          minHeight="min-h-[320px]"
        />
      </Card>
    );
  }

  if (!isAdmin) return null;

  /** Status control + comment editor, shared by the table and the card list. */
  const reviewControls = (item: SurgicalCase) => (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        aria-label={`Consultant comment for ${item.procedureName}`}
        placeholder="Add consultant comment…"
        value={editingComments[item.id] ?? ""}
        onChange={(e) => setEditingComments({ ...editingComments, [item.id]: e.target.value })}
        inputSize="sm"
        className="min-w-0 flex-1"
      />
      <Button
        variant="outline"
        size="icon-sm"
        disabled={savingCaseId === item.id}
        onClick={() => handleSaveComment(item.id)}
        aria-label={`Save comment for ${item.procedureName}`}
      >
        {savingCaseId === item.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const statusSelect = (item: SurgicalCase) => (
    <Select
      aria-label={`Approval status for ${item.procedureName}`}
      value={item.approvalStatus || "pending"}
      onChange={(e) =>
        handleUpdateStatus(item.id, e.target.value as "pending" | "approved" | "needs_review")
      }
      disabled={savingCaseId === item.id}
      selectSize="sm"
      className="w-36 font-medium"
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="needs_review">Needs Review</option>
    </Select>
  );

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} />}

      <PageHeader
        title="Consultant Audit Panel"
        icon={ShieldCheck}
        description="Inspect surgical trainees, review logged operative cases, approve logbook submissions, and leave feedback."
        actions={
          selectedTrainee ? (
            <Button variant="outline" size="sm" onClick={() => setSelectedTrainee(null)}>
              <ArrowLeft className="h-4 w-4" />
              Back to Trainee Directory
            </Button>
          ) : null
        }
      />

      {!selectedTrainee ? (
        /* VIEW 1 — trainee directory */
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <Field label="Search trainees" htmlFor="trainee-search">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <Input
                    id="trainee-search"
                    type="search"
                    placeholder="Search trainees by full name…"
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          {filteredTrainees.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title={traineeSearch ? "No trainees match your search" : "No trainees registered yet"}
                description={
                  traineeSearch
                    ? "Try a different name, or clear the search to see everyone."
                    : "Trainee accounts will appear here once they sign up."
                }
                action={
                  traineeSearch ? (
                    <Button variant="outline" size="sm" onClick={() => setTraineeSearch("")}>
                      Clear search
                    </Button>
                  ) : null
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredTrainees.map((trainee) => {
                const categoriesLoggedCount = Object.keys(trainee.categoryBreakdown).length;
                return (
                  <Card key={trainee.id} className="flex flex-col transition-colors hover:border-teal-500/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white dark:bg-teal-500 dark:text-slate-900">
                            {trainee.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base">{trainee.fullName}</CardTitle>
                            <CardDescription className="text-xs">Surgical Trainee</CardDescription>
                          </div>
                        </div>
                        <Badge variant="teal">{trainee.totalCases} Cases</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                      <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">Categories</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {categoriesLoggedCount} groups
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Last activity</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {trainee.lastActivity}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadTraineeCases(trainee)}
                        className="mt-auto w-full"
                      >
                        Inspect Operative Logbook
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2 — selected trainee */
        <div className="space-y-6">
          <Card className="border-teal-200 bg-teal-50/60 p-5 sm:p-6 dark:border-teal-900/60 dark:bg-teal-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white dark:bg-teal-500 dark:text-slate-900">
                {selectedTrainee.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {selectedTrainee.fullName}&apos;s Operative Logbook
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total cases: {traineeCases.length} • Last activity: {selectedTrainee.lastActivity}
                </p>
              </div>
            </div>
          </Card>

          {/* Filters — same grid, labels and controls as the Case Logbook */}
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              {/* Identical track to the Case Logbook filter bar. */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <Field label="Search" htmlFor="admin-case-search" className="sm:col-span-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <Input
                      id="admin-case-search"
                      type="search"
                      placeholder="Procedures, supervisors or hospitals…"
                      value={caseSearch}
                      onChange={(e) => setCaseSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </Field>

                <Field label="Role" htmlFor="admin-role" className="sm:col-span-2 xl:col-span-2">
                  <Select
                    id="admin-role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Performed">Performed</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Observed">Observed</option>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <Field label="From" htmlFor="admin-start">
                    <Input
                      id="admin-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Field>

                  <Field label="To" htmlFor="admin-end">
                    <Input
                      id="admin-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            {casesLoading ? (
              <LoadingState label="Loading trainee cases…" minHeight="min-h-[280px]" />
            ) : filteredCases.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No cases to review"
                description="This trainee has no logged cases matching your current filters."
                minHeight="min-h-[280px]"
              />
            ) : (
              <>
                {/* Desktop / tablet table */}
                <div className="hidden lg:block">
                  <TableWrapper minWidth="min-w-[1080px]">
                    <TableHead>
                      <tr>
                        <TH>Date &amp; Case Info</TH>
                        <TH>Role &amp; Complexity</TH>
                        <TH>Supervisor &amp; Location</TH>
                        <TH>Approval Status</TH>
                        <TH>Consultant Feedback</TH>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {filteredCases.map((item) => (
                        <TableRow key={item.id}>
                          <TD className="max-w-[18rem]">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {item.procedureName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {item.category} • {item.date}
                            </p>
                            {item.notes && (
                              <p className="mt-1 truncate text-xs italic text-slate-500 dark:text-slate-400">
                                &quot;{item.notes}&quot;
                              </p>
                            )}
                          </TD>

                          <TD className="whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1.5">
                              <RoleBadge role={item.role} />
                              <ComplexityBadge complexity={item.complexity} />
                            </div>
                          </TD>

                          <TD className="max-w-[14rem]">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {item.supervisorName}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {item.hospitalWard}
                            </p>
                          </TD>

                          <TD className="whitespace-nowrap">
                            <div className="flex flex-col items-start gap-2">
                              <ApprovalBadge status={item.approvalStatus} />
                              {statusSelect(item)}
                            </div>
                          </TD>

                          <TD className="min-w-[16rem]">{reviewControls(item)}</TD>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableWrapper>
                </div>

                {/* Mobile / tablet card list */}
                <ul className="divide-y divide-slate-100 lg:hidden dark:divide-slate-700/60">
                  {filteredCases.map((item) => (
                    <li key={item.id} className="space-y-3 p-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.procedureName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {item.category} • {item.date}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <RoleBadge role={item.role} />
                        <ComplexityBadge complexity={item.complexity} />
                        <ApprovalBadge status={item.approvalStatus} />
                      </div>

                      <dl className="space-y-1 text-xs">
                        <div className="flex gap-2">
                          <dt className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                            Supervisor
                          </dt>
                          <dd className="min-w-0 text-slate-700 dark:text-slate-300">
                            {item.supervisorName}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                            Location
                          </dt>
                          <dd className="min-w-0 text-slate-700 dark:text-slate-300">
                            {item.hospitalWard}
                          </dd>
                        </div>
                      </dl>

                      <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                        {statusSelect(item)}
                        {reviewControls(item)}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
