import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, files } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key missing. Please configure GEMINI_API_KEY in your environment variables (.env.local)."
        },
        { status: 400 }
      );
    }

    // System instructions configuring the persona of the AI companion
    const systemInstruction = {
      parts: [
        {
          text: "You are the Higsi AI Assistant, an advanced learning assistant designed for university students. You help them review courses, summarize notes, solve tasks, and study. You have access to user-uploaded documents (PDFs, DOCX, TXT, MD) and images. Use the context of these files to answer their questions when appropriate. Be clear, professional, and explain complex concepts simply."
        }
      ]
    };

    // Construct the contents structure expected by the Gemini API
    const contents: any[] = [];

    // Separate chat history (all except last message) and the current user request
    const history = messages.slice(0, -1);
    const lastMsg = messages[messages.length - 1];

    // Append history messages to contents
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [
          { text: msg.content }
        ]
      });
    }

    // Prepare parts array for the final message (supports multimodal content)
    const lastMsgParts: any[] = [];

    // Append uploaded files context if present
    if (files && files.length > 0) {
      let fileTextContext = "User uploaded files for reference:\n\n";
      let hasTextFiles = false;

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          // Extract base64 image data payload without header prefix
          const base64Data = file.base64Data?.split(",")[1] || file.base64Data;
          if (base64Data) {
            lastMsgParts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            });
          }
        } else if (file.extractedText) {
          hasTextFiles = true;
          fileTextContext += `--- FILE START: ${file.name} (Type: ${file.type}) ---\n`;
          fileTextContext += `${file.extractedText}\n`;
          fileTextContext += `--- FILE END: ${file.name} ---\n\n`;
        }
      }

      if (hasTextFiles) {
        lastMsgParts.push({ text: fileTextContext });
      }
    }

    // Append user's text question to the final parts array
    lastMsgParts.push({ text: lastMsg.content });

    contents.push({
      role: "user",
      parts: lastMsgParts
    });

    // Request payload structure matching Gemini 1.5 Flash specifications
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction,
          contents
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error payload:", errText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const resData = await response.json();
    const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error("Chat route handler error:", err);
    return NextResponse.json(
      { error: err.message || "An error occurred during chat processing" },
      { status: 500 }
    );
  }
}
