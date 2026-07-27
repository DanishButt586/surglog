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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { INITIAL_CASES, SurgicalCase } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

      const assistantReply: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantReply]);
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
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-7rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            AI Logbook Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Study assistant powered by Google Gemini to help reflect, practice viva questions, and analyze logged cases.
          </p>
        </div>
      </div>

      {/* Case Selector Dropdown */}
      <Card className="p-4 bg-teal-50/50 dark:bg-slate-800/50 border-teal-200 dark:border-teal-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200 font-semibold text-xs whitespace-nowrap">
            <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Select Logged Case for Context:</span>
          </div>

          <Select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="flex-1 text-xs"
          >
            <option value="none">-- No specific case (General study query) --</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.date} — {c.procedureName} ({c.category} • {c.role})
              </option>
            ))}
          </Select>

          {selectedCase && (
            <Badge variant="teal" className="text-[10px] sm:self-center">
              Active Context: {selectedCase.procedureName}
            </Badge>
          )}
        </div>
      </Card>

      {/* Chat Messages Container */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-xs border-slate-200 dark:border-slate-800">
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <div className="h-8 w-8 rounded-lg bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-xs ${
                    isAssistant
                      ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                      : "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 font-medium"
                  }`}
                >
                  {msg.content}
                </div>

                {!isAssistant && (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-8 w-8 rounded-lg bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Thinking & analyzing surgical references...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSuggestion("Draft a reflective learning note")}
            className="text-[11px] h-7 gap-1"
          >
            <FileText className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            Draft reflection note
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSuggestion("Give me viva exam questions")}
            className="text-[11px] h-7 gap-1"
          >
            <HelpCircle className="h-3 w-3 text-amber-500" />
            Give me viva questions
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSuggestion("How should I categorize this case?")}
            className="text-[11px] h-7 gap-1"
          >
            <BookOpen className="h-3 w-3 text-emerald-500" />
            Categorization advice
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSuggestion("Explain anatomical landmarks & surgical steps")}
            className="text-[11px] h-7 gap-1"
          >
            <Stethoscope className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            Anatomy & landmarks
          </Button>
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-800"
        >
          <Input
            type="text"
            placeholder={
              selectedCase
                ? `Ask about ${selectedCase.procedureName}...`
                : "Ask about a surgical procedure, viva question, or reflective note..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={loading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
