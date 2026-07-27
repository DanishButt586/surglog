import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are the Logbook Assistant inside SurgLog, a surgical case-logging app for surgical students/residents. Your job is to help students study and reflect on cases they have already logged — NOT to give real clinical or diagnostic advice for actual patients. You can: (1) help draft a reflective learning note about a specific logged case when the student shares its details (procedure, role, complexity, notes), (2) generate likely viva/exam-style questions related to a procedure the student logged, (3) explain general surgical concepts and terminology for study purposes, and (4) give plain guidance on how to fill the logbook well. Always keep a supportive, professional, tutor-like tone. If a student describes a real, current patient situation needing clinical judgment, do not give diagnostic or treatment advice — tell them to consult their supervising surgeon/consultant immediately. Never claim certainty about clinical outcomes. Keep responses concise and structured, using short headers or bullet points where helpful.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedCase } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Context preparation if a case was selected
    let caseContextPrompt = "";
    if (selectedCase) {
      caseContextPrompt = `[Selected Case Context]:\n- Procedure: ${selectedCase.procedureName || selectedCase.procedure_name}\n- Category: ${selectedCase.category}\n- Role: ${selectedCase.role}\n- Complexity: ${selectedCase.complexity}\n- Date: ${selectedCase.date}\n- Notes: ${selectedCase.notes || "None"}\n\n`;
    }

    // Prepare contents for Gemini SDK
    // Convert message history to GoogleGenerativeAI contents structure
    const formattedHistory = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Inject case context into the last user prompt if not already present
    if (formattedHistory.length > 0 && selectedCase) {
      const lastUserMsg = formattedHistory[formattedHistory.length - 1];
      if (lastUserMsg.role === "user" && !lastUserMsg.parts[0].text.includes("[Selected Case Context]")) {
        lastUserMsg.parts[0].text = `${caseContextPrompt}${lastUserMsg.parts[0].text}`;
      }
    }

    // Try models in order of availability: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
    let responseText = "";

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        // Use generateContent with complete message history
        const chatContents = formattedHistory.length > 0 
          ? formattedHistory 
          : [{ role: "user", parts: [{ text: caseContextPrompt + "Hello!" }] }];

        const result = await model.generateContent({
          contents: chatContents,
        });

        responseText = result.response.text();
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} attempt error:`, err?.message || err);
      }
    }

    if (!responseText) {
      return NextResponse.json(
        { error: "Unable to generate AI response from Gemini API. Please verify key access." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while communicating with Gemini." },
      { status: 500 }
    );
  }
}
