/**
 * POST /api/chat
 *
 * Streaming chat endpoint that forwards user messages to Gemini
 * and streams the response back via Server-Sent Events (SSE).
 *
 * Security:
 * - Rate limiting via token bucket
 * - Input sanitization (prompt injection prevention)
 * - Input validation (history schema)
 */

import { NextRequest, NextResponse } from "next/server";
import { streamChatResponse, type ChatMessage } from "@/lib/gemini";
import { sanitizeUserMessage, validateChatHistory } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rateLimit";

/** GET /api/chat — not allowed */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  // ── 1. Rate Limiting ─────────────────────────────────────────────────────
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, remaining, resetInMs } = checkRateLimit(clientIp);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment before trying again.",
        resetInMs,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetInMs / 1000)),
          "Retry-After": String(Math.ceil(resetInMs / 1000)),
        },
      }
    );
  }

  // ── 2. Parse Request Body ────────────────────────────────────────────────
  let body: { message: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // ── 3. Sanitize Message ──────────────────────────────────────────────────
  const { sanitized, error: sanitizeError } = sanitizeUserMessage(
    body.message
  );
  if (!sanitized) {
    return NextResponse.json({ error: sanitizeError }, { status: 400 });
  }

  // ── 4. Validate History ──────────────────────────────────────────────────
  const history = body.history ?? [];
  const { valid, error: historyError } = validateChatHistory(history);
  if (!valid) {
    return NextResponse.json({ error: historyError }, { status: 400 });
  }

  // ── 5. Stream Gemini Response ────────────────────────────────────────────
  try {
    const streamResult = await streamChatResponse(
      history as ChatMessage[],
      sanitized
    );

    // Create a ReadableStream that yields SSE-formatted chunks
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              // SSE format: data: <json>\n\n
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          // Signal end of stream
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (streamError) {
          console.error("Gemini stream error:", streamError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(remaining),
        "Access-Control-Allow-Origin":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
