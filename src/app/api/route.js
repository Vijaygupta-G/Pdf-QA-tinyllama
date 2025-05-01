export async function GET(request) {
  console.log("request", request);
  return new Response("Hello, Next.js!", {
    status: 200,
  });
}