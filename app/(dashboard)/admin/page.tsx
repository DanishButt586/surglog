"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Filter,
  Save,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Data states
  const [trainees, setTrainees] = useState<TraineeSummary[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeSummary | null>(null);
  const [traineeCases, setTraineeCases] = useState<SurgicalCase[]>([]);

  // Search & Filter states
  const [traineeSearch, setTraineeSearch] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit comments state
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

      // Check is_admin
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

      // Fetch all trainees and their cases
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

          const lastCaseDate = userCases.length > 0 ? userCases[0].date : p.created_at?.substring(0, 10) || "No activity";

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
    setLoading(true);
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

      // Pre-fill comments map
      const initialComments: Record<string, string> = {};
      mapped.forEach((c) => {
        initialComments[c.id] = c.adminComment || "";
      });
      setEditingComments(initialComments);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (caseId: string, newStatus: "pending" | "approved" | "needs_review") => {
    setSavingCaseId(caseId);
    const supabase = createClient();
    const currentComment = editingComments[caseId] || "";

    const { error } = await supabase
      .from("cases")
      .update({
        approval_status: newStatus,
        admin_comment: currentComment,
      })
      .eq("id", caseId);

    if (!error) {
      setTraineeCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, approvalStatus: newStatus, adminComment: currentComment } : c))
      );
      setToastMessage(`Case review status updated to "${newStatus}"!`);
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
      setToastMessage("Consultant feedback comment saved!");
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
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;

    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && c.date >= startDate;
    if (endDate) matchesDate = matchesDate && c.date <= endDate;

    return matchesSearch && matchesRole && matchesCategory && matchesDate;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "needs_review":
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertCircle className="h-3 w-3" /> Needs Review
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="gap-1 text-xs">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  if (loading && trainees.length === 0) {
    return (
      <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
        <p className="text-sm font-medium">Verifying Admin privileges & fetching trainee logbooks...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Program Director & Consultant Audit Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inspect surgical trainees, review logged operative cases, approve logbook submissions, and leave feedback.
          </p>
        </div>

        {selectedTrainee && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTrainee(null)}
            className="gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Trainee Directory
          </Button>
        )}
      </div>

      {/* VIEW 1: Trainees Directory */}
      {!selectedTrainee ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search trainees by full name..."
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainees.map((trainee) => {
              const categoriesLoggedCount = Object.keys(trainee.categoryBreakdown).length;
              return (
                <Card
                  key={trainee.id}
                  className="hover:border-teal-500/50 transition-all cursor-pointer group"
                  onClick={() => loadTraineeCases(trainee)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">
                          {trainee.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {trainee.fullName}
                          </CardTitle>
                          <CardDescription className="text-xs">Surgical Trainee</CardDescription>
                        </div>
                      </div>
                      <Badge variant="teal" className="text-[10px]">
                        {trainee.totalCases} Cases
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span>Procedure Categories:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{categoriesLoggedCount} groups</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Last Activity:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{trainee.lastActivity}</span>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        Inspect Operative Logbook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: Selected Trainee Case Log Inspection */
        <div className="space-y-6">
          <Card className="p-4 bg-teal-50/50 dark:bg-slate-900/50 border-teal-200 dark:border-teal-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedTrainee.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTrainee.fullName}&apos;s Operative Logbook
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total Cases: {traineeCases.length} • Last Activity: {selectedTrainee.lastActivity}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filters Bar */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search procedures or hospitals..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="All">All Roles</option>
                    <option value="Performed">Performed</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Observed">Observed</option>
                  </Select>
                </div>

                <div className="sm:col-span-3">
                  <Input
                    type="date"
                    title="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Input
                    type="date"
                    title="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trainee Case Table with Review Dropdown & Comments */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4 pl-6">Date & Case Info</th>
                    <th className="p-4">Role & Complexity</th>
                    <th className="p-4">Supervisor & Location</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4 pr-6">Consultant Feedback & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCases.length > 0 ? (
                    filteredCases.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.procedureName}</p>
                          <p className="text-xs text-slate-500">{item.category} • {item.date}</p>
                          {item.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1 max-w-xs truncate">
                              &quot;{item.notes}&quot;
                            </p>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap space-y-1">
                          <div>
                            <Badge variant="teal">{item.role}</Badge>
                          </div>
                          <div>
                            <Badge variant="default" className="text-[10px]">{item.complexity} Complexity</Badge>
                          </div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{item.supervisorName}</p>
                          <p className="text-xs text-slate-500 truncate">{item.hospitalWard}</p>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {getStatusBadge(item.approvalStatus)}
                            <Select
                              value={item.approvalStatus || "pending"}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  item.id,
                                  e.target.value as "pending" | "approved" | "needs_review"
                                )
                              }
                              disabled={savingCaseId === item.id}
                              className="text-xs h-8 w-36 font-semibold"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="needs_review">Needs Review</option>
                            </Select>
                          </div>
                        </td>

                        <td className="p-4 pr-6">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="Add consultant comment..."
                              value={editingComments[item.id] ?? ""}
                              onChange={(e) =>
                                setEditingComments({ ...editingComments, [item.id]: e.target.value })
                              }
                              className="text-xs h-8"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={savingCaseId === item.id}
                              onClick={() => handleSaveComment(item.id)}
                              className="h-8 px-2"
                              title="Save comment"
                            >
                              {savingCaseId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500">
                        No cases logged by this trainee match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
