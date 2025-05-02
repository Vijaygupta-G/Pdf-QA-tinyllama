import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pdf from "@/models/Pdf";
import { getEmbeddingModel } from "@/lib/helper";

// Calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
};

export async function POST(req) {
  try {
    const { query, pdfId } = await req.json();

    await connectToDB();
    
    // Get PDF document
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      return NextResponse.json(
        { error: "PDF not found" },
        { status: 404 }
      );
    }

    // Generate embedding for query
    const model = await getEmbeddingModel();
    const queryEmbedding = Array.from((await model(query)).data);

    // Find most similar chunks
    const similarities = pdf.chunks.map(chunk => ({
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      pageNumber: chunk.pageNumber
    }));

    // Sort by similarity and take top chunks
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    // Create context from top chunks
    const context = topChunks
      .map(chunk => `[Page ${chunk.pageNumber}] ${chunk.content}`)
      .join('\n\n');

    // Update query stats
    await Pdf.findByIdAndUpdate(pdfId, {
      lastQueried: new Date(),
      $inc: { queryCount: 1 }
    });

    // Construct prompt for LLM
    const prompt = `Use the following excerpts from a PDF document to answer the question.
If you cannot find the answer in the excerpts, say "I cannot find the answer in the provided content."

Excerpts:
${context}

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
    console.error("Query error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
