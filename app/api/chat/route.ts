import { NextRequest, NextResponse } from "next/server";

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

    // Prepare case context if selected
    let caseContextPrompt = "";
    if (selectedCase) {
      caseContextPrompt = `[Selected Case Context]:\n- Procedure: ${selectedCase.procedureName || selectedCase.procedure_name}\n- Category: ${selectedCase.category}\n- Role: ${selectedCase.role}\n- Complexity: ${selectedCase.complexity}\n- Date: ${selectedCase.date}\n- Notes: ${selectedCase.notes || "None"}\n\n`;
    }

    // Prepare contents array
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    if (contents.length > 0 && selectedCase) {
      const lastUserMsg = contents[contents.length - 1];
      if (lastUserMsg.role === "user" && !lastUserMsg.parts[0].text.includes("[Selected Case Context]")) {
        lastUserMsg.parts[0].text = `${caseContextPrompt}${lastUserMsg.parts[0].text}`;
      }
    }

    // Candidate Flash models list
    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let responseText = "";
    let lastErrorDetails = "";

    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: contents,
          }),
        });

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
          break;
        } else if (data?.error?.message) {
          lastErrorDetails = `[${modelName}]: ${data.error.message}`;
          console.warn(`Gemini API call failed for ${modelName}:`, data.error);
        }
      } catch (err: any) {
        lastErrorDetails = err?.message || String(err);
      }
    }

    if (!responseText) {
      return NextResponse.json(
        {
          error: `Gemini API error: ${lastErrorDetails || "Invalid API key format. Please obtain a valid Gemini API Key starting with AIzaSy... from Google AI Studio (https://aistudio.google.com/)."}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("Gemini Route Exception:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
