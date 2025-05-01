import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import path from "path";
import {promises as fs } from "fs";
import pdfParse from "pdf-parse";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdfFile");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dataDir = path.join(process.cwd(), "test", "data");
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, `05-versions-space.pdf`);
    await fs.writeFile(filePath, buffer);

    let pdfFile = await fs.readFile(filePath);
    let pdfData;
    
    try {
      // Properly await the PDF parsing
      const data = await pdfParse(pdfFile);
      pdfData = {
        text: data.text,
        metadata: data.metadata,
        numpages: data.numpages
      };
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      return NextResponse.json(
        { error: "Failed to parse PDF" },
        { status: 500 }
      );
    }

    await connectToDB();

console.log("Db connected", pdfData);

    const saved = await Pdf.create({
      filename: file.name,
      content: pdfData,
    });

    return NextResponse.json({
      message: "PDF content saved to MongoDB",
      id: saved._id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
