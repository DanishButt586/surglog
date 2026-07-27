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
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { INITIAL_CATEGORIES, SurgicalCase } from "@/lib/mock-data";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Reads a themed CSS custom property so charts follow light/dark mode. */
function useChartColors() {
  const [colors, setColors] = useState({
    grid: "#cbd5e1",
    axis: "#64748b",
    series1: "#0d9488",
    series2: "#10b981",
    series3: "#f59e0b",
    muted: "#94a3b8",
    card: "#ffffff",
    border: "#e2e8f0",
    foreground: "#1e293b",
  });

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const get = (name: string, fallback: string) =>
        styles.getPropertyValue(name).trim() || fallback;

      setColors({
        grid: get("--chart-grid", "#cbd5e1"),
        axis: get("--chart-axis", "#64748b"),
        series1: get("--chart-1", "#0d9488"),
        series2: get("--chart-2", "#10b981"),
        series3: get("--chart-3", "#f59e0b"),
        muted: get("--chart-muted", "#94a3b8"),
        card: get("--card", "#ffffff"),
        border: get("--border", "#e2e8f0"),
        foreground: get("--foreground", "#1e293b"),
      });
    };

    read();

    // next-themes toggles a class on <html>; re-read when it changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

/** Below `md` the charts get shorter and drop dense tick labels. */
function useIsCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

export default function AnalyticsPage() {
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [targetMap, setTargetMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const colors = useChartColors();
  const isCompact = useIsCompact();

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: casesData } = await supabase.from("cases").select("*").eq("user_id", user.id);

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

  const categoryNames =
    Object.keys(targetMap).length > 0
      ? Object.keys(targetMap)
      : INITIAL_CATEGORIES.map((c) => c.name);

  const categoryBarData = categoryNames.map((catName) => {
    const loggedCount = cases.filter((c) => c.category === catName).length;
    const required = targetMap[catName] || 10;
    return {
      name: catName.length > 16 ? `${catName.substring(0, 14)}…` : catName,
      fullName: catName,
      Logged: loggedCount,
      Target: required,
    };
  });

  const performedCount = cases.filter((c) => c.role === "Performed").length;
  const assistedCount = cases.filter((c) => c.role === "Assisted").length;
  const observedCount = cases.filter((c) => c.role === "Observed").length;

  const roleBreakdownData = [
    { name: "Performed", value: performedCount },
    { name: "Assisted", value: assistedCount },
    { name: "Observed", value: observedCount },
  ];
  const pieColors = [colors.series1, colors.series2, colors.series3];

  const now = new Date();
  const last12Months: { monthKey: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    last12Months.push({ monthKey, label });
  }

  const monthlyTrendData = last12Months.map(({ monthKey, label }) => ({
    month: label,
    cases: cases.filter((c) => c.date.startsWith(monthKey)).length,
  }));

  const primaryAutonomyPct =
    cases.length > 0 ? Math.round((performedCount / cases.length) * 100) : 0;

  // One tooltip style shared by all three charts, driven by theme tokens.
  const tooltipStyle = {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "0.5rem",
    color: colors.foreground,
    fontSize: "12px",
    boxShadow: "0 4px 12px rgb(15 23 42 / 0.12)",
  } as const;

  const hasData = cases.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surgical Case Analytics"
        description="Visual metrics tracking procedure distribution, 12-month volume trends, and surgical role autonomy."
      />

      {loading ? (
        <Card>
          <LoadingState label="Calculating live surgical analytics…" minHeight="min-h-[360px]" />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            <StatCard label="Total Cases" value={cases.length} icon={Activity} tone="teal" />
            <StatCard
              label="Primary Autonomy"
              value={`${primaryAutonomyPct}%`}
              icon={PieChartIcon}
              tone="emerald"
            />
            <StatCard
              label="Performed Volume"
              value={performedCount}
              footnote="cases as primary surgeon"
              icon={TrendingUp}
              tone="amber"
            />
            <StatCard
              label="Assisted / Observed"
              value={assistedCount + observedCount}
              footnote="supporting-role cases"
              icon={BarChart3}
              tone="teal"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
            <Card className="flex flex-col lg:col-span-7">
              {/* min-h on the header keeps the two chart cards in this row
                  starting their plot area at the same y-offset. */}
              <CardHeader className="pb-2 sm:min-h-[6.5rem]">
                <CardTitle>Total Cases per Category</CardTitle>
                <CardDescription>Logged surgical count compared against target</CardDescription>
              </CardHeader>
              <CardContent className="h-72 pt-2 sm:h-80">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBarData}
                      margin={{ top: 8, right: 8, left: -18, bottom: isCompact ? 8 : 48 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke={colors.axis}
                        tickLine={false}
                        axisLine={{ stroke: colors.grid }}
                        // On phones the angled per-category labels overlap into
                        // an unreadable smear, so they are hidden there and the
                        // tooltip carries the category name instead.
                        tick={isCompact ? false : { fontSize: 11, fill: colors.axis }}
                        angle={isCompact ? 0 : -35}
                        textAnchor={isCompact ? "middle" : "end"}
                        interval={0}
                        height={isCompact ? 8 : 60}
                      />
                      <YAxis
                        stroke={colors.axis}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: colors.axis }}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: colors.grid, opacity: 0.25 }}
                        labelFormatter={(label, items) => items?.[0]?.payload?.fullName || label}
                      />
                      <Bar dataKey="Logged" fill={colors.series1} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Target" fill={colors.muted} opacity={0.45} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No cases to chart yet"
                    description="Log a case to see your category distribution here."
                    minHeight="min-h-full"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col lg:col-span-5">
              <CardHeader className="pb-2 sm:min-h-[6.5rem]">
                <CardTitle>Surgical Role Breakdown</CardTitle>
                <CardDescription>Observed / Assisted / Performed distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-72 pt-2 sm:h-80">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <Pie
                        data={roleBreakdownData}
                        cx="50%"
                        cy="45%"
                        innerRadius="45%"
                        outerRadius="70%"
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {roleBreakdownData.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconType="circle"
                        iconSize={9}
                        formatter={(value) => (
                          <span style={{ color: colors.axis, fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={PieChartIcon}
                    title="No role data yet"
                    description="Your Observed / Assisted / Performed split appears once you log cases."
                    minHeight="min-h-full"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cases Logged per Month</CardTitle>
              <CardDescription>Rolling 12-month procedure volume trend</CardDescription>
            </CardHeader>
            <CardContent className="h-64 pt-2 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke={colors.axis}
                    tickLine={false}
                    axisLine={{ stroke: colors.grid }}
                    tick={{ fontSize: 11, fill: colors.axis }}
                    // Show every other month on phones so labels never collide.
                    interval={isCompact ? 1 : 0}
                    minTickGap={4}
                  />
                  <YAxis
                    stroke={colors.axis}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: colors.axis }}
                    width={40}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: colors.grid }} />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke={colors.series1}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: colors.series1, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
