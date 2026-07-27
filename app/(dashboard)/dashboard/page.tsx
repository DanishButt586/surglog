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
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INITIAL_CATEGORIES, SurgicalCase, CategoryTarget } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [categories, setCategories] = useState<CategoryTarget[]>(INITIAL_CATEGORIES);
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch cases
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

      // Fetch targets
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
        // Compute from default categories if no targets table row
        const mappedDefaults = INITIAL_CATEGORIES.map((cat) => ({
          ...cat,
          currentCount: userCases.filter((c) => c.category === cat.name).length,
        }));
        setCategories(mappedDefaults);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCases = cases.length;

  // Calculate cases logged this month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const casesThisMonth = cases.filter((c) => c.date.startsWith(currentMonthStr)).length;

  const completedCategoriesCount = categories.filter((c) => c.currentCount >= c.requiredCount).length;
  const inProgressCategoriesCount = categories.length - completedCategoriesCount;

  const roleBadges = {
    Performed: "teal",
    Assisted: "success",
    Observed: "warning",
  } as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your procedure targets, log recent cases, and stay on target for residency requirements.
          </p>
        </div>
        <Link href="/cases/new">
          <Button variant="primary" className="shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Log New Case
          </Button>
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="hover:border-teal-500/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Cases Logged
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCases}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live Supabase Sync</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ClipboardList className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cases This Month
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{casesThisMonth}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Current Month Volume</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-teal-500/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Categories In Progress
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {inProgressCategoriesCount} <span className="text-lg font-medium text-slate-400">/ {categories.length}</span>
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <Award className="h-3.5 w-3.5" />
                <span>{completedCategoriesCount} Categories Completed</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Category Progress List + Recent Cases Mini-List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Surgery Category Progress List (7 columns) */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Category Targets Progress</CardTitle>
              <CardDescription>Required case-count completion by procedure group</CardDescription>
            </div>
            <Link href="/targets">
              <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400 hover:text-teal-700">
                Edit Targets
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Fetching category progress...</span>
              </div>
            ) : (
              categories.map((cat) => {
                const isCompleted = cat.currentCount >= cat.requiredCount;
                const pct = Math.min(Math.round((cat.currentCount / cat.requiredCount) * 100), 100);

                return (
                  <div key={cat.id} className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                        {isCompleted ? (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <CheckCircle className="h-3 w-3" /> Met
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[11px]">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 ml-2 whitespace-nowrap">
                        {cat.currentCount} / {cat.requiredCount} ({pct}%)
                      </span>
                    </div>
                    <Progress value={cat.currentCount} max={cat.requiredCount} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Cases Mini-List (5 columns) */}
        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Recent Log Entries</CardTitle>
              <CardDescription>Latest surgical cases recorded</CardDescription>
            </div>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="text-teal-600 dark:text-teal-400 hover:text-teal-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Loading recent cases...</span>
              </div>
            ) : cases.length > 0 ? (
              cases.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 flex items-start justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {item.procedureName}
                      </span>
                      <Badge variant={roleBadges[item.role] || "default"} className="text-[10px]">
                        {item.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.supervisorName} • {item.hospitalWard}
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {item.date}
                    </span>
                  </div>
                  <Link href={`/cases/${item.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm font-semibold">No recent cases recorded</p>
                <p className="text-xs text-slate-400 mt-1">Log your first case to see it here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
