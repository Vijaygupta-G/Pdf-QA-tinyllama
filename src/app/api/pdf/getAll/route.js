import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import { NextResponse } from "next/server";

// get all pdfs
export async function GET(req) {
  try {
    await connectToDB();
    const pdfs = await Pdf.find({});
    return NextResponse.json(pdfs);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDFs" },
      { status: 500 }
    );
  }
}