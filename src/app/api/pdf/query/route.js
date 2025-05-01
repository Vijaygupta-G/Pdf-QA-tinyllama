import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
// import { OpenAI } from "openai";
import Pdf from "../../../../models/Pdf";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OLLAMA_API_URL = "http://localhost:11434/api/generate";

export async function POST(req) {
  const body = await req.json();
  const { question } = body;

  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  try {
    await connectToDB();
    const pdfs = await Pdf.find({});

    if (!pdfs || pdfs.length === 0) {
      return NextResponse.json(
        { error: "PDF data not found" },
        { status: 404 }
      );
    }

    let answer = null;

    for (const pdf of pdfs) {
      // Extract text content properly
      const pdfContent = pdf.content?.text || pdf.content || "";

      const prompt = `PDF content: ${pdfContent}\n\nQuestion: ${question}`;

      const payload = JSON.stringify({
        model: "tinyllama", // or "mistral", 'llama2', 'gemma', etc.
        prompt,
        stream: false,
      });

      console.log("Payload", payload);

      const ollamaRes = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const data = await ollamaRes.json();

      console.log("Ai Response", data);

      if (data.response) {
        answer = data.response.trim();
        break; // stop after the first valid answer
      }
    }

    if (!answer) {
      return NextResponse.json(
        { error: "No relevant answer found in PDFs" },
        { status: 404 }
      );
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
//  // For chat Gpt
// export async function POST(req) {
//   const body = await req.json();
//   const { question } = body;

//   if (!question) {
//     return NextResponse.json(
//       { error: "Missing PDF ID or question" },
//       { status: 400 }
//     );
//   }

//   try {
//     await connectToDB();
//     const pdfs = await Pdf.find({});
//     if (!pdfs || pdfs.length === 0) {
//       return NextResponse.json({ error: "PDF data not found" }, { status: 404 });
//     }

//     let answer = null;

//     for (const pdf of pdfs) {
//       const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//         role: "system",
//         content:
//           "You are an assistant answering questions based on uploaded PDFs.",
//         },
//         {
//         role: "user",
//         content: `PDF content: ${pdf.content}\n\nQuestion: ${question}`,
//         },
//       ],
//       });

//       answer = response.choices[0]?.message?.content;

//       if (answer) {
//       break; // Exit the loop if an answer is found
//       }
//     }

//     if (!answer) {
//       return NextResponse.json(
//       { error: "No relevant answer found in PDFs" },
//       { status: 404 }
//       );
//     }

//     return NextResponse.json({ answer });
//   } catch (error) {
//     console.error("Query error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // Delete all PDFs
// export async function DELETE(req) {
//   try {
//     await connectToDB();
//     await Pdf.deleteMany({});
//     return NextResponse.json({ message: "Database cleared successfully" });
//   } catch (error) {
//     console.error("Error clearing database:", error);
//     return NextResponse.json(
//       { error: "Failed to clear database" },
//       { status: 500 }
//     );
//   }
// }
