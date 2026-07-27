"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INITIAL_CATEGORIES, CategoryTarget } from "@/lib/mock-data";
import { Save, RotateCcw, CheckCircle2, Target, Plus, Trash2 } from "lucide-react";

export default function TargetSettingsPage() {
  const [categories, setCategories] = useState<CategoryTarget[]>(INITIAL_CATEGORIES);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTarget, setNewCategoryTarget] = useState<number | "">(10);

  const handleTargetChange = (id: string, newTarget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, requiredCount: Math.max(1, newTarget) } : c))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleResetDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: CategoryTarget = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      requiredCount: Number(newCategoryTarget) || 10,
      currentCount: 0,
    };
    setCategories([...categories, newCat]);
    setNewCategoryName("");
    setNewCategoryTarget(10);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Target Settings & Requirements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure required procedure counts for ACGME / Royal College of Surgeons audit targets.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1.5">
          <RotateCcw className="h-4 w-4 text-slate-500" />
          Reset to ACGME Defaults
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold text-sm">Target requirements saved!</p>
            <p className="text-xs">Your dashboard case progress bars have been updated accordingly.</p>
          </div>
        </div>
      )}

      {/* Target Settings List Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Procedure Category Targets</CardTitle>
            <CardDescription>
              Set the minimum required case threshold for each procedure group.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => {
              const isCompleted = cat.currentCount >= cat.requiredCount;
              const pct = Math.min(Math.round((cat.currentCount / cat.requiredCount) * 100), 100);

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                      {isCompleted ? (
                        <Badge variant="success" className="text-[10px]">
                          Target Met
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          In Progress
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Logged: {cat.currentCount} cases</span>
                      <span>•</span>
                      <span>Progress: {pct}%</span>
                    </div>

                    <Progress value={cat.currentCount} max={cat.requiredCount} className="mt-2" />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        Required Target:
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={cat.requiredCount}
                        onChange={(e) => handleTargetChange(cat.id, Number(e.target.value))}
                        className="w-24 h-9 text-center font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      aria-label="Remove category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>

          {/* Add New Category Box */}
          <div className="p-4 mx-6 mb-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center gap-3">
            <Input
              type="text"
              placeholder="New Procedure Category (e.g. Splenectomy)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              placeholder="Target Count"
              value={newCategoryTarget}
              onChange={(e) => setNewCategoryTarget(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-32"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCategory}
              className="w-full sm:w-auto text-xs whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </div>

          <CardFooter className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button type="submit" variant="primary" className="shadow-sm gap-1.5">
              <Save className="h-4 w-4" />
              Save Target Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
