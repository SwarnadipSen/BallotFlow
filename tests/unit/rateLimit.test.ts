import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, cleanupStaleBuckets } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  const testIp = `test-ip-${Date.now()}`; // Unique per test run

  it("allows requests within the token limit", () => {
    const result = checkRateLimit(testIp);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("tracks tokens correctly across requests", () => {
    const uniqueIp = `unique-ip-${Math.random()}`;
    const first = checkRateLimit(uniqueIp);
    const second = checkRateLimit(uniqueIp);
    // Second request should have one fewer token
    expect(first.remaining).toBe(second.remaining + 1);
  });

  it("returns different limits for different IPs", () => {
    const ip1 = `ip-a-${Math.random()}`;
    const ip2 = `ip-b-${Math.random()}`;
    const r1 = checkRateLimit(ip1);
    const r2 = checkRateLimit(ip2);
    // Both should start with full tokens (independently)
    expect(r1.remaining).toBe(r2.remaining);
  });

  it("returns resetInMs as a positive number", () => {
    const uniqueIp = `reset-ip-${Math.random()}`;
    const result = checkRateLimit(uniqueIp);
    expect(result.resetInMs).toBeGreaterThan(0);
  });
});

describe("cleanupStaleBuckets", () => {
  it("runs without throwing and returns pruned count", () => {
    // Fill a bucket, then prune
    const id = `stale-${Math.random()}`;
    checkRateLimit(id);
    const pruned = cleanupStaleBuckets();
    expect(typeof pruned).toBe("number");
  });

  it("allows requests up to the token limit (burst)", () => {
    const id = `burst-${Math.random()}`;
    // Should allow 20 requests (RATE_LIMIT_MAX_TOKENS)
    for (let i = 0; i < 20; i++) {
      const result = checkRateLimit(id);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the 21st request after consecutive calls", () => {
    const id = `block-${Math.random()}`;
    for (let i = 0; i < 20; i++) checkRateLimit(id);
    const blocked = checkRateLimit(id);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
