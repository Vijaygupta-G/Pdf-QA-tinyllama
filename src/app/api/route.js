import Pdf from "@/models/Pdf";
import { NextResponse } from "next/server";

export async function GET(request) {
  console.log("request", request);
  return new Response("Hello, Next.js!", {
    status: 200,
  });
}