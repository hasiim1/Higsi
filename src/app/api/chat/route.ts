import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in .env.local" },
        { status: 400 },
      );
    }

    const lastMsg = messages?.[messages.length - 1];
    const userPrompt =
      typeof lastMsg === "string" ? lastMsg : lastMsg?.content || "";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Details:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: data.error?.message || "Gemini API request failed" },
        { status: response.status },
      );
    }

    const aiResponseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text generated.";

    return NextResponse.json({ text: aiResponseText });
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
