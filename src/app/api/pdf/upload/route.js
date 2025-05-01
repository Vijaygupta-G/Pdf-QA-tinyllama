import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import path from "path";
import { promises as fs } from "fs";
import { savePdfContent } from "@/lib/helper";

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

    // Connect to database
    await connectToDB();

    // Create PDF record
    const saved = await Pdf.create({
      filename: file.name,
    });

    // Save PDF content as text for RAG
    await savePdfContent(pdfPath, saved._id);

    return NextResponse.json({
      message: "PDF content saved successfully",
      id: saved._id,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
