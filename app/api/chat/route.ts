/**
 * POST /api/chat
 *
 * Streaming chat endpoint. Accepts a user message + optional conversation
 * history, streams a Gemini response back via Server-Sent Events (SSE).
 *
 * Pipeline:
 *   Rate limit → Parse → Sanitize → Validate history →
 *   Cache lookup → Stream Gemini → Cache store (first-turn only)
 *
 * Security controls:
 *   - Token bucket rate limiting per IP
 *   - Prompt injection detection via sanitizeUserMessage
 *   - History schema validation
 *   - CSP / security headers applied by middleware.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { streamChatResponse } from "@/lib/gemini";
import { sanitizeUserMessage, validateChatHistory } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCachedResponse, setCachedResponse } from "@/lib/responseCache";
import { logger } from "@/lib/logger";
import { SSE_DONE_SENTINEL, DEFAULT_APP_URL } from "@/lib/constants";
import type { GeminiMessage, ChatRequestBody } from "@/types";

// ─── Module-level constants (allocated once, not per-request) ─────────────────

/** Reused across all streaming responses in this instance */
const encoder = new TextEncoder();

/** SSE headers shared by all successful responses */
const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Encodes a value as an SSE `data:` line */
function sseChunk(payload: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

/** Encodes the SSE end-of-stream sentinel */
const SSE_DONE_CHUNK = encoder.encode(`data: ${SSE_DONE_SENTINEL}\n\n`);

/** Extracts the real client IP from standard proxy headers */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/** GET /api/chat — not supported */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest): Promise<Response> {
  const clientIp = getClientIp(request);

  // ── 1a. Validate Content-Type ──────────────────────────────────────────────
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json." },
      { status: 415 }
    );
  }

  // ── 1b. Rate Limiting ──────────────────────────────────────────────────────
  const { allowed, remaining, resetInMs } = checkRateLimit(clientIp);

  if (!allowed) {
    logger.warn("Rate limit exceeded", { ip: clientIp });
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again.", resetInMs },
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

  // ── 2. Parse Body ───────────────────────────────────────────────────────────
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  // ── 3. Sanitize Message ─────────────────────────────────────────────────────
  const { sanitized, error: sanitizeError } = sanitizeUserMessage(body.message);
  if (!sanitized) {
    return NextResponse.json({ error: sanitizeError }, { status: 400 });
  }

  // ── 4. Validate History ─────────────────────────────────────────────────────
  const history: GeminiMessage[] = body.history ?? [];
  const { valid, error: historyError } = validateChatHistory(history);
  if (!valid) {
    return NextResponse.json({ error: historyError }, { status: 400 });
  }

  const isFirstTurn = history.length === 0;

  // ── 5. Cache Lookup (first-turn only) ───────────────────────────────────────
  if (isFirstTurn) {
    const cached = getCachedResponse(sanitized);
    if (cached) {
      logger.debug("Cache hit", { ip: clientIp, messageLength: sanitized.length });

      // Replay the cached response as a single SSE chunk + done
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(sseChunk({ text: cached }));
          controller.enqueue(SSE_DONE_CHUNK);
          controller.close();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          ...SSE_HEADERS,
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": String(remaining),
          "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
        },
      });
    }
  }

  // ── 6. Stream Gemini Response ───────────────────────────────────────────────
  logger.info("Gemini request", { ip: clientIp, firstTurn: isFirstTurn });

  try {
    const streamResult = await streamChatResponse(history, sanitized);

    // Accumulate the full response text so we can cache it after streaming
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(sseChunk({ text }));
            }
          }

          // Cache the complete response for future identical first-turn queries
          if (isFirstTurn && fullResponse) {
            setCachedResponse(sanitized, fullResponse);
          }

          controller.enqueue(SSE_DONE_CHUNK);
        } catch (streamError) {
          logger.error("Gemini stream error", {
            error: streamError instanceof Error ? streamError.message : String(streamError),
          });
          controller.enqueue(sseChunk({ error: "Stream interrupted. Please try again." }));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...SSE_HEADERS,
        "X-Cache": "MISS",
        "X-RateLimit-Remaining": String(remaining),
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    logger.error("Chat API error", { error: message, ip: clientIp });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
