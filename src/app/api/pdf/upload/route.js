import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import path from "path";
import { promises as fs } from "fs";
import { processPdfForRag } from "@/lib/helper";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdfFile");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "test", "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Save PDF file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfPath = path.join(dataDir, file.name);
    await fs.writeFile(pdfPath, buffer);

    // Process PDF for RAG
    const { rawText, chunks } = await processPdfForRag(pdfPath);

    // Connect to database
    await connectToDB();

    // Create PDF record with RAG data
    const saved = await Pdf.create({
      filename: file.name,
      rawText,
      chunks
    });

    // Clean up temporary file
    await fs.unlink(pdfPath);

    return NextResponse.json({
      message: "PDF processed and saved successfully",
      id: saved._id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
