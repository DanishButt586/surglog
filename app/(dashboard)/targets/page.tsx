"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { INITIAL_CATEGORIES, CategoryTarget } from "@/lib/mock-data";
import { Save, RotateCcw, Target, Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TargetSettingsPage() {
  const [categories, setCategories] = useState<CategoryTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTarget, setNewCategoryTarget] = useState<number | "">(10);

  const fetchTargets = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: casesData } = await supabase
        .from("cases")
        .select("category")
        .eq("user_id", user.id);
      const { data: targetsData } = await supabase.from("targets").select("*").eq("user_id", user.id);

      if (targetsData && targetsData.length > 0) {
        const mapped: CategoryTarget[] = targetsData.map((t: any) => ({
          id: t.id,
          name: t.category,
          requiredCount: t.required_count,
          currentCount: casesData?.filter((c: any) => c.category === t.category).length || 0,
        }));
        setCategories(mapped);
      } else {
        setCategories(INITIAL_CATEGORIES);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleTargetChange = (id: string, newTarget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, requiredCount: Math.max(1, newTarget) } : c))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const upsertPayload = categories.map((cat) => ({
        user_id: user.id,
        category: cat.name,
        required_count: cat.requiredCount,
      }));

      await supabase.from("targets").upsert(upsertPayload, { onConflict: "user_id,category" });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleResetDefaults = () => setCategories(INITIAL_CATEGORIES);

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

  const handleDeleteCategory = async (id: string) => {
    const targetToDelete = categories.find((c) => c.id === id);
    setCategories(categories.filter((c) => c.id !== id));
    if (targetToDelete && !id.startsWith("cat-")) {
      const supabase = createClient();
      await supabase.from("targets").delete().eq("id", id);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Target Settings & Requirements"
        icon={Target}
        description="Configure required procedure counts for ACGME / Royal College of Surgeons audit targets."
        actions={
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4" />
            Reset to ACGME Defaults
          </Button>
        }
      />

      {savedSuccess && (
        <Alert tone="success" title="Target requirements saved">
          Your dashboard progress bars have been updated accordingly.
        </Alert>
      )}

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Procedure Category Targets</CardTitle>
            <CardDescription>
              Set the minimum required case threshold for each procedure group.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <LoadingState label="Loading targets…" />
            ) : categories.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No procedure categories yet"
                description="Add your first category below to start tracking audit requirements."
              />
            ) : (
              categories.map((cat) => {
                const isCompleted = cat.currentCount >= cat.requiredCount;
                const pct = Math.min(Math.round((cat.currentCount / cat.requiredCount) * 100), 100);
                const inputId = `target-${cat.id}`;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center dark:border-slate-700/60 dark:bg-slate-900/40"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-base font-semibold text-slate-900 dark:text-white">
                          {cat.name}
                        </span>
                        {isCompleted ? (
                          <Badge variant="success">Target Met</Badge>
                        ) : (
                          <Badge variant="warning">In Progress</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Logged: {cat.currentCount} cases</span>
                        <span aria-hidden="true">•</span>
                        <span>Progress: {pct}%</span>
                      </div>

                      <Progress
                        value={cat.currentCount}
                        max={cat.requiredCount}
                        label={`${cat.name} progress`}
                      />
                    </div>

                    <div className="flex shrink-0 items-end gap-2">
                      <Field label="Required target" htmlFor={inputId}>
                        <Input
                          id={inputId}
                          type="number"
                          min={1}
                          value={cat.requiredCount}
                          onChange={(e) => handleTargetChange(cat.id, Number(e.target.value))}
                          className="w-24 text-center font-semibold"
                        />
                      </Field>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        aria-label={`Remove ${cat.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Add a category */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 dark:border-slate-600 dark:bg-slate-900/40">
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-12">
                <Field
                  label="New procedure category"
                  htmlFor="new-category-name"
                  className="sm:col-span-6"
                >
                  <Input
                    id="new-category-name"
                    type="text"
                    placeholder="e.g. Splenectomy"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </Field>

                <Field label="Target count" htmlFor="new-category-target" className="sm:col-span-3">
                  <Input
                    id="new-category-target"
                    type="number"
                    min={1}
                    placeholder="10"
                    value={newCategoryTarget}
                    onChange={(e) =>
                      setNewCategoryTarget(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Field>

                <Button
                  variant="secondary"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="w-full sm:col-span-3"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
            <Button type="submit" disabled={loading || saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Target Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
