"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ClipboardList,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { INITIAL_CATEGORIES, SurgicalCase, CategoryTarget } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";

export default function DashboardPage() {
  const [categories, setCategories] = useState<CategoryTarget[]>(INITIAL_CATEGORIES);
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: casesData } = await supabase
          .from("cases")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        let userCases: SurgicalCase[] = [];
        if (casesData && casesData.length > 0) {
          userCases = casesData.map((item: any) => ({
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
        }

        setCases(userCases);

        const { data: targetsData } = await supabase
          .from("targets")
          .select("*")
          .eq("user_id", user.id);

        if (targetsData && targetsData.length > 0) {
          const mappedTargets: CategoryTarget[] = targetsData.map((t: any) => {
            const currentCount = userCases.filter((c) => c.category === t.category).length;
            return {
              id: t.id,
              name: t.category,
              requiredCount: t.required_count,
              currentCount,
            };
          });
          setCategories(mappedTargets);
        } else {
          const mappedDefaults = INITIAL_CATEGORIES.map((cat) => ({
            ...cat,
            currentCount: userCases.filter((c) => c.category === cat.name).length,
          }));
          setCategories(mappedDefaults);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCases = cases.length;
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const casesThisMonth = cases.filter((c) => c.date.startsWith(currentMonthStr)).length;
  const completedCategoriesCount = categories.filter((c) => c.currentCount >= c.requiredCount).length;
  const inProgressCategoriesCount = categories.length - completedCategoriesCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Track your procedure targets, log recent cases, and stay on target for residency requirements."
        actions={
          <Link href="/cases/new" className={buttonStyles({ size: "md" })}>
            <Plus className="h-4 w-4" />
            Log New Case
          </Link>
        }
      />

      {error && (
        <Alert tone="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Stat row. Stays 2-up between md and lg: at md the sidebar takes 256px,
          which leaves each of three columns too narrow for the label + value. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <StatCard
          label="Total Cases Logged"
          value={totalCases}
          footnote="Live Supabase sync"
          footnoteIcon={TrendingUp}
          footnoteTone="positive"
          icon={ClipboardList}
          tone="teal"
        />
        <StatCard
          label="Cases This Month"
          value={casesThisMonth}
          footnote="Current month volume"
          footnoteIcon={Calendar}
          icon={Clock}
          tone="emerald"
        />
        <StatCard
          label="Categories In Progress"
          value={
            <>
              {inProgressCategoriesCount}
              <span className="text-lg font-medium text-slate-400 dark:text-slate-500">
                {" "}
                / {categories.length}
              </span>
            </>
          }
          footnote={`${completedCategoriesCount} categories completed`}
          footnoteIcon={Award}
          footnoteTone="positive"
          icon={Target}
          tone="amber"
        />
      </div>

      {/* Category progress + recent entries */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-4">
            <div className="min-w-0 space-y-1.5">
              <CardTitle>Category Targets Progress</CardTitle>
              <CardDescription>Required case-count completion by procedure group</CardDescription>
            </div>
            <Link
              href="/targets"
              className={buttonStyles({ variant: "ghost", size: "sm", className: "shrink-0" })}
            >
              Edit Targets
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {loading ? (
              <LoadingState label="Fetching category progress…" />
            ) : categories.length > 0 ? (
              categories.map((cat) => {
                const isCompleted = cat.currentCount >= cat.requiredCount;
                const pct = Math.min(Math.round((cat.currentCount / cat.requiredCount) * 100), 100);

                return (
                  <div
                    key={cat.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/40"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {cat.name}
                        </span>
                        {isCompleted ? (
                          <Badge variant="success">
                            <CheckCircle aria-hidden="true" /> Met
                          </Badge>
                        ) : (
                          <Badge variant="warning">In Progress</Badge>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        {cat.currentCount} / {cat.requiredCount} ({pct}%)
                      </span>
                    </div>
                    <Progress value={cat.currentCount} max={cat.requiredCount} />
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={Target}
                title="No categories configured"
                description="Add procedure categories in Target Settings to start tracking progress."
                action={
                  <Link href="/targets" className={buttonStyles({ size: "sm" })}>
                    Configure Targets
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-5">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-4">
            <div className="min-w-0 space-y-1.5">
              <CardTitle>Recent Log Entries</CardTitle>
              <CardDescription>Latest surgical cases recorded</CardDescription>
            </div>
            <Link
              href="/cases"
              className={buttonStyles({ variant: "ghost", size: "sm", className: "shrink-0" })}
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {loading ? (
              <LoadingState label="Loading recent cases…" />
            ) : cases.length > 0 ? (
              cases.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.procedureName}
                      </span>
                      <RoleBadge role={item.role} />
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.supervisorName} • {item.hospitalWard}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.date}</p>
                  </div>
                  <Link
                    href={`/cases/${item.id}/edit`}
                    className={buttonStyles({ variant: "outline", size: "xs" })}
                  >
                    Edit
                  </Link>
                </div>
              ))
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No recent cases recorded"
                description="Log your first case and it will appear here."
                action={
                  <Link href="/cases/new" className={buttonStyles({ size: "sm" })}>
                    <Plus className="h-4 w-4" />
                    Log Your First Case
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
