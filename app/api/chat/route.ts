// Forwards chat requests to the Cloudflare Worker (portfolio-assistant).
// The shared secret stays on the server; the browser only ever calls /api/chat.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 16_000;

export async function POST(request: Request) {
  const upstreamUrl = process.env.ASSISTANT_URL;
  const secret = process.env.ASSISTANT_SECRET;
  if (!upstreamUrl || !secret) {
    return json({ error: "The assistant isn't set up yet. Please email urjalaa@gmail.com." }, 503);
  }

  const body = await request.text();
  if (body.length > MAX_BODY_CHARS) {
    return json({ error: "That conversation is too long. Try clearing the chat." }, 413);
  }

  // Every request reaches the Worker from Vercel, so pass the visitor's IP
  // along or all visitors would share one rate limit.
  const visitorIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
        "X-Visitor-IP": visitorIp,
      },
      body,
      signal: request.signal,
      cache: "no-store",
    });
  } catch {
    return json({ error: "Sorry, I can't answer right now. Please email urjalaa@gmail.com." }, 502);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function json(data: unknown, status: number) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
