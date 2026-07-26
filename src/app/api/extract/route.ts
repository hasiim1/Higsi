import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import pdf from "pdf-parse";
// @ts-ignore
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const parsePdf = typeof pdf === "function" ? pdf : (pdf as any).default || pdf;
      const data = await parsePdf(buffer);
      text = data.text;
    } else if (file.name.endsWith(".docx")) {
      const parseMammoth = typeof mammoth === "object" && mammoth !== null && (mammoth as any).extractRawText ? mammoth : (mammoth as any).default || mammoth;
      const result = await parseMammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Extraction error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract text" },
      { status: 500 },
    );
  }
}
