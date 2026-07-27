"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { INITIAL_CATEGORIES, SurgicalCase } from "@/lib/mock-data";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AnalyticsPage() {
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [targetMap, setTargetMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch cases
        const { data: casesData } = await supabase
          .from("cases")
          .select("*")
          .eq("user_id", user.id);

        if (casesData) {
          const mapped: SurgicalCase[] = casesData.map((item: any) => ({
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
          setCases(mapped);
        }

        // Fetch targets
        const { data: targetsData } = await supabase
          .from("targets")
          .select("category, required_count")
          .eq("user_id", user.id);

        const tMap: Record<string, number> = {};
        if (targetsData && targetsData.length > 0) {
          targetsData.forEach((t: any) => {
            tMap[t.category] = t.required_count;
          });
        } else {
          INITIAL_CATEGORIES.forEach((c) => {
            tMap[c.name] = c.requiredCount;
          });
        }
        setTargetMap(tMap);
      }
      setLoading(false);
    }
    fetchAnalyticsData();
  }, []);

  // Compute Bar Chart Data (Category vs Target)
  const categoryNames = Object.keys(targetMap).length > 0 ? Object.keys(targetMap) : INITIAL_CATEGORIES.map((c) => c.name);
  const categoryBarData = categoryNames.map((catName) => {
    const loggedCount = cases.filter((c) => c.category === catName).length;
    const required = targetMap[catName] || 10;
    return {
      name: catName.length > 16 ? `${catName.substring(0, 14)}...` : catName,
      fullName: catName,
      Logged: loggedCount,
      Target: required,
    };
  });

  // Compute Role Breakdown (Doughnut Chart)
  const performedCount = cases.filter((c) => c.role === "Performed").length;
  const assistedCount = cases.filter((c) => c.role === "Assisted").length;
  const observedCount = cases.filter((c) => c.role === "Observed").length;

  const roleBreakdownData = [
    { name: "Performed", value: performedCount || (cases.length === 0 ? 1 : 0), color: "#0D9488" },
    { name: "Assisted", value: assistedCount, color: "#10B981" },
    { name: "Observed", value: observedCount, color: "#F59E0B" },
  ];

  // Compute Monthly Trend (Line Chart)
  const monthMap: Record<string, number> = {};
  cases.forEach((c) => {
    const monthKey = c.date.substring(0, 7); // YYYY-MM
    monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const monthlyTrendData = sortedMonths.map((m) => {
    const dateObj = new Date(`${m}-01`);
    const monthName = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return {
      month: monthName,
      cases: monthMap[m],
    };
  });

  const pieColors = ["#0D9488", "#10B981", "#F59E0B"];
  const primaryAutonomyPct = cases.length > 0 ? Math.round((performedCount / cases.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Surgical Case Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual metrics tracking procedure distribution, monthly volume trends, and surgical role autonomy from Supabase.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
          <span>Calculating live surgical analytics from Supabase...</span>
        </div>
      ) : (
        <>
          {/* Top Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Total Cases</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{cases.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-teal-600 dark:text-teal-400 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Primary Autonomy</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{primaryAutonomyPct}%</p>
                  </div>
                  <PieChartIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Performed Volume</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{performedCount} cases</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Assisted / Observed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{assistedCount + observedCount} cases</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-teal-600 dark:text-teal-400 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Row 1: Bar Chart (Categories) & Doughnut Chart (Roles) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bar Chart: Cases by Category (7 cols) */}
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Procedure Volume vs Target by Category</CardTitle>
                <CardDescription>Logged surgical count compared against required target</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                      formatter={(value: any, name: any) => [value, name]}
                      labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                    />
                    <Bar dataKey="Logged" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Target" fill="#94A3B8" opacity={0.4} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Doughnut Chart: Role Breakdown (5 cols) */}
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Surgical Role Breakdown</CardTitle>
                <CardDescription>Distribution of Observed, Assisted, and Performed cases</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleBreakdownData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Chart Row 2: Line Chart (Monthly Trend) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Monthly Case Logging Trend</CardTitle>
              <CardDescription>Number of cases logged per month over time</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="#0D9488"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#0D9488" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Log cases across multiple dates to view monthly trends over time.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
