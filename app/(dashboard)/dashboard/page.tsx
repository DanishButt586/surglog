"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INITIAL_CATEGORIES, INITIAL_CASES } from "@/lib/mock-data";

export default function DashboardPage() {
  const [categories] = useState(INITIAL_CATEGORIES);
  const [cases] = useState(INITIAL_CASES);

  const casesThisMonth = 12;
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
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">48</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+8 new cases this week</span>
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
                <span>July 2026</span>
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
            {categories.map((cat) => {
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
            })}
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
            {cases.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 flex items-start justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {item.procedureName}
                    </span>
                    <Badge variant={roleBadges[item.role]} className="text-[10px]">
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
