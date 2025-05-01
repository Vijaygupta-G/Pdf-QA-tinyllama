import { NextResponse } from "next/server";
import { getPdfContent } from "@/lib/helper";
import { findRelevantChunks } from "@/lib/rag";

export async function POST(req) {
  try {
    const { query, pdfId } = await req.json();

    // Get PDF content
    const pdfContent = await getPdfContent(pdfId);
    if (!pdfContent) {
      return NextResponse.json(
        { error: "PDF content not found" },
        { status: 404 }
      );
    }

    // Find relevant chunks using RAG
    const relevantChunks = await findRelevantChunks(query, pdfContent);

    // Construct prompt with context
    const contextText = relevantChunks
      .map((chunk) => chunk.content)
      .join("\n\n");

    const prompt = `Use the following excerpts from a PDF document to answer the question.
If you cannot find the answer in the excerpts, say "I cannot find the answer in the provided content."

Excerpts:
${contextText}

Question: ${query}

Answer:`;

    // Call Ollama with the enhanced prompt
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tinyllama",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ answer: data.response });
  } catch (error) {
    console.error("Error in query endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
