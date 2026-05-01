/**
 * Token bucket rate limiter for API routes.
 * Prevents abuse and controls Gemini API costs.
 * Uses in-memory store — replace with Redis (Cloud Memorystore) in production.
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/** In-memory store: ip -> bucket */
const buckets = new Map<string, TokenBucket>();

/** Rate limit configuration */
const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  maxTokens: 20,
  /** Refill interval in milliseconds (1 minute) */
  refillIntervalMs: 60_000,
  /** Tokens added per refill interval */
  refillAmount: 20,
} as const;

/**
 * Checks if a request from the given identifier is within rate limits.
 *
 * @param identifier - Usually the client IP address
 * @returns `{ allowed: boolean, remaining: number, resetInMs: number }`
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
} {
  const now = Date.now();

  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = {
      tokens: RATE_LIMIT_CONFIG.maxTokens,
      lastRefill: now,
    };
    buckets.set(identifier, bucket);
  }

  // Refill tokens based on time elapsed
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT_CONFIG.refillIntervalMs) {
    bucket.tokens = Math.min(
      RATE_LIMIT_CONFIG.maxTokens,
      bucket.tokens +
        Math.floor(elapsed / RATE_LIMIT_CONFIG.refillIntervalMs) *
          RATE_LIMIT_CONFIG.refillAmount
    );
    bucket.lastRefill = now;
  }

  const resetInMs = RATE_LIMIT_CONFIG.refillIntervalMs - (now - bucket.lastRefill);

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens, resetInMs };
}

/**
 * Periodically cleans up stale buckets to prevent memory leaks.
 * Run this on a schedule in production.
 */
export function cleanupStaleBuckets(): void {
  const now = Date.now();
  const staleThreshold = RATE_LIMIT_CONFIG.refillIntervalMs * 10;

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > staleThreshold) {
      buckets.delete(key);
    }
  }
}
