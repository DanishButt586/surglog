"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  FileText,
  Stethoscope,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { INITIAL_CASES, SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "Draft reflection note", prompt: "Draft a reflective learning note", icon: FileText },
  { label: "Give me viva questions", prompt: "Give me viva exam questions", icon: HelpCircle },
  { label: "Categorization advice", prompt: "How should I categorize this case?", icon: BookOpen },
  {
    label: "Anatomy & landmarks",
    prompt: "Explain anatomical landmarks & surgical steps",
    icon: Stethoscope,
  },
];

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h3
              key={idx}
              className="mb-1 mt-3 text-sm font-semibold tracking-tight text-slate-900 first:mt-0 dark:text-white"
            >
              {renderInlineBold(headerText)}
            </h3>
          );
        }

        if (trimmed === "***" || trimmed === "---") {
          return <hr key={idx} className="my-2 border-slate-200 dark:border-slate-600" />;
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const bulletText = trimmed.replace(/^[*\-]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />
              <span className="min-w-0 flex-1 leading-relaxed">{renderInlineBold(bulletText)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAssistantPage() {
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("none");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your SurgLog Assistant. Select one of your logged surgical cases above or ask me any question to draft reflective learning notes, generate board-style viva exam questions, or clarify surgical concepts for your studies.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUserCases() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("cases")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (data && data.length > 0) {
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
          }));
          setCases(mapped);
        } else {
          setCases(INITIAL_CASES);
        }
      } else {
        setCases(INITIAL_CASES);
      }
    }
    loadUserCases();
  }, []);

  // Scroll the message list itself rather than calling scrollIntoView, which
  // also yanks the outer page scroller around.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          selectedCase: selectedCase ? selectedCase : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to get response from AI assistant");
      }

      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: data.reply },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMsg(err?.message || "An error occurred while connecting to the AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuggestion = (promptText: string) => {
    let finalPrompt = promptText;
    if (selectedCase) {
      finalPrompt = `${promptText} for procedure "${selectedCase.procedureName}" (${selectedCase.category}, ${selectedCase.role} role).`;
    }
    handleSendMessage(finalPrompt);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="AI Logbook Assistant"
        icon={Sparkles}
        description="Study assistant powered by Google Gemini to help reflect, practice viva questions, and analyze logged cases."
      />

      {/* Case context selector */}
      {/* Same accent-banner treatment and padding as the Admin Panel's
          trainee banner, so the two context strips read as one component. */}
      <Card className="border-teal-200 bg-teal-50/60 p-5 sm:p-6 dark:border-teal-900/60 dark:bg-teal-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor="case-context"
            className="flex shrink-0 items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-200"
          >
            <Stethoscope className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            Case context:
          </label>

          <Select
            id="case-context"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="min-w-0 flex-1"
          >
            <option value="none">No specific case (general study query)</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.date} — {c.procedureName} ({c.category} • {c.role})
              </option>
            ))}
          </Select>

          {selectedCase && (
            <Badge variant="teal" className="max-w-full self-start sm:self-center">
              <span className="truncate">Active: {selectedCase.procedureName}</span>
            </Badge>
          )}
        </div>
      </Card>

      {/* Chat panel. A viewport-relative height keeps the composer on screen at
          every breakpoint without hard-coding the navbar/padding offsets that
          the previous calc() got wrong on every screen size. */}
      <Card className="flex h-[65dvh] min-h-[26rem] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%] ${
                    isAssistant
                      ? "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                      : "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900"
                  }`}
                >
                  {isAssistant ? (
                    <FormattedMarkdown content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Thinking &amp; analyzing surgical references…</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertCircle className="mt-px h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
          {QUICK_PROMPTS.map(({ label, prompt, icon: Icon }) => (
            <Button
              key={label}
              variant="outline"
              size="xs"
              disabled={loading}
              onClick={() => handleQuickSuggestion(prompt)}
            >
              <Icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              {label}
            </Button>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex shrink-0 items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
        >
          <label htmlFor="chat-input" className="sr-only">
            Message the AI assistant
          </label>
          <Input
            id="chat-input"
            type="text"
            placeholder={
              selectedCase
                ? `Ask about ${selectedCase.procedureName}…`
                : "Ask about a procedure, viva question, or reflective note…"
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="min-w-0 flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !inputMessage.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
