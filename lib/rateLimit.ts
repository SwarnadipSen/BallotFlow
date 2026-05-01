/**
 * Token bucket rate limiter.
 *
 * Algorithm: Each IP gets a bucket of tokens. One token is consumed per request.
 * Tokens refill at a fixed rate over time. When the bucket is empty, requests
 * are rejected with HTTP 429.
 *
 * Storage: In-memory Map — sufficient for a single Cloud Run instance.
 *
 * Production note: For multi-instance deployments (Cloud Run with >1 instance),
 * replace this with a Redis/Memorystore-backed implementation so rate limits
 * are enforced globally across all instances.
 */

import {
  RATE_LIMIT_MAX_TOKENS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_REFILL_AMOUNT,
  RATE_LIMIT_STALE_MS,
} from "@/lib/constants";
import type { RateLimitResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

/** ip → bucket mapping; never exported so callers can't mutate it directly */
const buckets = new Map<string, TokenBucket>();

// ─── Cleanup ──────────────────────────────────────────────────────────────────

/**
 * Removes buckets that have been inactive for RATE_LIMIT_STALE_MS.
 * Call this on a recurring interval (e.g. every 10 minutes) to prevent
 * unbounded memory growth in long-running instances.
 *
 * @returns The number of buckets that were pruned
 */
export function cleanupStaleBuckets(): number {
  const now = Date.now();
  let pruned = 0;

  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > RATE_LIMIT_STALE_MS) {
      buckets.delete(key);
      pruned++;
    }
  }

  return pruned;
}

// Schedule automatic cleanup every 10 minutes when this module is loaded
// Only runs in Node.js (server) environments, not in Edge runtime
if (typeof setInterval !== "undefined" && typeof process !== "undefined") {
  const TEN_MINUTES = 10 * 60 * 1000;
  setInterval(cleanupStaleBuckets, TEN_MINUTES).unref();
}

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Checks whether a request from `identifier` is within rate limits,
 * consuming one token if allowed.
 *
 * @param identifier - Client IP address (or any stable identifier)
 * @returns `{ allowed, remaining, resetInMs }`
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const normalizedId = identifier.toLowerCase().trim() || "unknown";

  let bucket = buckets.get(normalizedId);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_MAX_TOKENS, lastRefill: now };
    buckets.set(normalizedId, bucket);
  }

  // Refill tokens proportional to elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    const windows = Math.floor(elapsed / RATE_LIMIT_WINDOW_MS);
    bucket.tokens = Math.min(
      RATE_LIMIT_MAX_TOKENS,
      bucket.tokens + windows * RATE_LIMIT_REFILL_AMOUNT
    );
    bucket.lastRefill = now;
  }

  const resetInMs = RATE_LIMIT_WINDOW_MS - (now - bucket.lastRefill);

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens, resetInMs };
}
