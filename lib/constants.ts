/**
 * Application-wide constants.
 * Single source of truth for all magic values — model names, limits, timeouts.
 * Never hardcode these inline; always import from here.
 */

// ─── AI / Gemini ──────────────────────────────────────────────────────────────

/** Gemini model used for all chat responses */
export const GEMINI_MODEL = "gemini-2.0-flash" as const;

/** Maximum tokens Gemini will produce per response */
export const GEMINI_MAX_OUTPUT_TOKENS = 2048;

/** Response creativity (0 = deterministic, 1 = creative) */
export const GEMINI_TEMPERATURE = 0.7;

/** Nucleus sampling parameter */
export const GEMINI_TOP_P = 0.9;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

/** Maximum requests a single IP can make per window */
export const RATE_LIMIT_MAX_TOKENS = 20;

/** Duration of one rate-limit window in milliseconds */
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

/** Tokens re-added per window */
export const RATE_LIMIT_REFILL_AMOUNT = 20;

/** Milliseconds after which a bucket is considered stale and pruned */
export const RATE_LIMIT_STALE_MS = RATE_LIMIT_WINDOW_MS * 10;

// ─── Response Cache ───────────────────────────────────────────────────────────

/** Maximum number of cached responses kept in memory */
export const CACHE_MAX_SIZE = 200;

/** Time-to-live for a cached response in milliseconds */
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Chat Input ───────────────────────────────────────────────────────────────

/** Maximum characters allowed in a single user message */
export const MAX_MESSAGE_LENGTH = 2000;

/** Maximum number of previous messages sent as context */
export const MAX_HISTORY_LENGTH = 50;

// ─── UI ───────────────────────────────────────────────────────────────────────

/** Number of suggested prompts shown on the empty chat screen */
export const SUGGESTED_PROMPTS_COUNT = 8;

/** SSE done sentinel sent at the end of every stream */
export const SSE_DONE_SENTINEL = "[DONE]" as const;

/** Fallback app URL when env var is not set */
export const DEFAULT_APP_URL = "http://localhost:3000" as const;
