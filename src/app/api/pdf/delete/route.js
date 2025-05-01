import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing PDF ID" }, { status: 400 });
  }

  try {
    await connectToDB();
    const deletedPdf = await Pdf.findByIdAndDelete(id);
    if (!deletedPdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { error: "Failed to delete PDF" },
      { status: 500 }
    );
  }
}
