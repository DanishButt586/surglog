"use client";

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
import { INITIAL_CATEGORIES, MONTHLY_TREND_DATA, ROLE_BREAKDOWN_DATA } from "@/lib/mock-data";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const categoryBarData = INITIAL_CATEGORIES.map((c) => ({
    name: c.name.length > 16 ? `${c.name.substring(0, 14)}...` : c.name,
    fullName: c.name,
    Logged: c.currentCount,
    Target: c.requiredCount,
  }));

  const pieColors = ["#0D9488", "#10B981", "#F59E0B"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Surgical Case Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual metrics tracking procedure distribution, monthly volume trends, and surgical role autonomy.
        </p>
      </div>

      {/* Top Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Log Velocity</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3.2 / wk</p>
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
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45.8%</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Peak Month Volume</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14 cases</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Category Completion</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3 / 8 Met</p>
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
                  data={ROLE_BREAKDOWN_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ROLE_BREAKDOWN_DATA.map((entry, index) => (
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
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
        </CardContent>
      </Card>
    </div>
  );
}
