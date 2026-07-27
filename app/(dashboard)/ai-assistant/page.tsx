"use client";

import { useState } from "react";
import {
  Bot,
  User,
  Send,
  Plus,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, INITIAL_CHAT_SESSIONS, SUGGESTED_PROMPTS } from "@/lib/mock-data";

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState(INITIAL_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState("chat-1");
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Hello Dr. Reed! I am your SurgLog AI Surgical Study Assistant. Ask me anything about procedure steps, anatomical landmarks, suture material selections, or board exam preparation.",
      timestamp: "10:15 AM",
    },
    {
      id: "m-2",
      sender: "user",
      text: "What are the essential steps to achieve the Critical View of Safety (CVS) in Laparoscopic Cholecystectomy?",
      timestamp: "10:16 AM",
    },
    {
      id: "m-3",
      sender: "ai",
      text: `To reliably achieve the **Critical View of Safety (CVS)** during Laparoscopic Cholecystectomy, Strasberg guidelines require 3 criteria before clipping or dividing any structure:\n\n1. **Hepatocystic Triangle Clearance**: Clear all fat and fibrous tissue from the hepatocystic triangle (bounded by cystic duct, common hepatic duct, and inferior liver edge). Do NOT expose the common bile duct.\n2. **Dissecting Lower Gallbladder Bed**: Mobilize the lower 1/3 of the gallbladder off the liver bed (cystic plate).\n3. **Two Structures Identified**: Only two structures (cystic duct & cystic artery) must be seen entering the gallbladder directly.\n\n*Clinical Pearl:* Always perform a visual pause / timeout before firing clips!`,
      timestamp: "10:17 AM",
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    // Simulate AI response stream / reply delay
    setTimeout(() => {
      let aiText = `Here is a structured summary regarding **${query}**:\n\n1. **Key Anatomy**: Review primary arterial blood supply and innervation landmarks.\n2. **Operative Considerations**: Ensure adequate exposure, meticulous hemostasis, and clear visualization before dissection.\n3. **Complication Prevention**: Always maintain high vigilance for anatomical variations.\n\nWould you like me to elaborate further on surgical technique or landmark identification?`;

      if (query.toLowerCase().includes("hernia")) {
        aiText = `**Lichtenstein vs TAPP vs TEP Hernia Repair Overview**:\n\n• **Lichtenstein**: Anterior tension-free repair using polypropylene mesh secured to the inguinal ligament & pubic tubercle.\n• **TAPP (Transabdominal Preperitoneal)**: Laparoscopic approach entering peritoneal cavity to inspect hernia sac, creating a flap.\n• **TEP (Totally Extraperitoneal)**: Stays entirely within preperitoneal space, avoiding abdominal cavity entry.\n\n*Key Landmark*: Always protect the ilioinguinal nerve, iliohypogastric nerve, and genital branch of genitofemoral nerve!`;
      } else if (query.toLowerCase().includes("suture")) {
        aiText = `**Abdominal Wall Fascia Closure Standards**:\n\n• **Continuous Suture**: 2-0 or 1 PDS (Polydioxanone) delayed-absorbable monofilament.\n• **Small-Bites Technique**: 5 mm suture bites, 5 mm travel distance to achieve 4:1 suture-to-wound length ratio.\n• **Vascular/Anastomotic**: Prolene (polypropylene) non-absorbable suture for durable arterial repair.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newSession = { id: newId, title: "New Study Discussion", date: "Just now" };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: "ai",
        text: "New study session initialized! What surgical topic would you like to review?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Chat History Sidebar (Desktop & Tablet) */}
      <Card className="w-full md:w-72 flex flex-col p-3 shadow-sm border-slate-200 dark:border-slate-800">
        <Button variant="primary" onClick={handleNewChat} className="w-full justify-start gap-2 mb-3 shadow-xs">
          <Plus className="h-4 w-4" />
          New Study Session
        </Button>

        <p className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Recent Sessions</p>

        <div className="flex-1 overflow-y-auto space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeSessionId === session.id
                  ? "bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{session.title}</p>
                <p className="text-[10px] text-slate-400">{session.date}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col min-w-0 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Chat Top Banner */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                AI Surgical Study Assistant
                <Badge variant="teal" className="text-[10px] py-0">
                  Clinical AI
                </Badge>
              </h2>
              <p className="text-xs text-slate-500">Board prep, anatomy landmarks, & procedure technique</p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === "user"
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-teal-600 text-white"
                }`}
              >
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900 font-medium rounded-tr-none"
                    : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`text-[10px] block mt-2 opacity-70 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium p-2">
              <Sparkles className="h-4 w-4 animate-spin" />
              SurgLog AI is synthesizing surgical study notes...
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto whitespace-nowrap space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 inline-block mr-1">Suggested:</span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 transition-colors inline-block cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask a surgical question (e.g. Inguinal hernia mesh placement steps)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={() => handleSendMessage()}
            className="h-10 px-4 shadow-sm"
            aria-label="Send Prompt"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
