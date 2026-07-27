"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { INITIAL_CASES, INITIAL_CATEGORIES, SurgicalCase } from "@/lib/mock-data";

export default function CaseListPage() {
  const [casesList, setCasesList] = useState<SurgicalCase[]>(INITIAL_CASES);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter cases logic
  const filteredCases = casesList.filter((c) => {
    const matchesSearch =
      c.procedureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalWard.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || c.role === roleFilter;
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;

    return matchesSearch && matchesRole && matchesCategory;
  });

  const handleDeleteCase = (id: string) => {
    setCasesList((prev) => prev.filter((c) => c.id !== id));
    setDeleteTargetId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Surgical Case Logbook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, filter, search, and manage all your logged operative cases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cases/new">
            <Button variant="primary" className="shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Log New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input (5 cols) */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search procedure, supervisor, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter (3 cols) */}
            <div className="sm:col-span-3">
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Performed">Performed (Primary)</option>
                <option value="Assisted">Assisted</option>
                <option value="Observed">Observed</option>
              </Select>
            </div>

            {/* Category Filter (4 cols) */}
            <div className="sm:col-span-4">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Procedure Categories</option>
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {(searchQuery || roleFilter !== "All" || categoryFilter !== "All") && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Showing {filteredCases.length} of {casesList.length} total cases</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("All");
                  setCategoryFilter("All");
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
                      <Badge variant={roleBadges[item.role]}>{item.role}</Badge>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <Badge variant={complexityBadges[item.complexity]}>{item.complexity}</Badge>
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
                  <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-base font-semibold">No surgical cases found</p>
                    <p className="text-xs mt-1">Try adjusting your search terms or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              Are you sure you want to remove this case from your logbook? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCase(deleteTargetId)}
              >
                Delete Case
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
