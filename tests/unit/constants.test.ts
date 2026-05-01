import { describe, it, expect } from "vitest";
import {
  GEMINI_MODEL,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_TEMPERATURE,
  GEMINI_TOP_P,
  RATE_LIMIT_MAX_TOKENS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_STALE_MS,
  CACHE_MAX_SIZE,
  CACHE_TTL_MS,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_LENGTH,
  SSE_DONE_SENTINEL,
  DEFAULT_APP_URL,
} from "@/lib/constants";

/**
 * Constants smoke-tests.
 *
 * Purpose: These tests act as a "contract" — they fail immediately if someone
 * accidentally changes a constant to an invalid value (e.g. sets MAX_MESSAGE_LENGTH
 * to 0, or changes SSE_DONE_SENTINEL). This catches regressions before deployment.
 */
describe("lib/constants — value contracts", () => {
  describe("Gemini config", () => {
    it("GEMINI_MODEL is a non-empty string", () => {
      expect(typeof GEMINI_MODEL).toBe("string");
      expect(GEMINI_MODEL.length).toBeGreaterThan(0);
    });

    it("GEMINI_MAX_OUTPUT_TOKENS is a positive integer", () => {
      expect(Number.isInteger(GEMINI_MAX_OUTPUT_TOKENS)).toBe(true);
      expect(GEMINI_MAX_OUTPUT_TOKENS).toBeGreaterThan(0);
    });

    it("GEMINI_TEMPERATURE is between 0 and 1 inclusive", () => {
      expect(GEMINI_TEMPERATURE).toBeGreaterThanOrEqual(0);
      expect(GEMINI_TEMPERATURE).toBeLessThanOrEqual(1);
    });

    it("GEMINI_TOP_P is between 0 and 1 inclusive", () => {
      expect(GEMINI_TOP_P).toBeGreaterThanOrEqual(0);
      expect(GEMINI_TOP_P).toBeLessThanOrEqual(1);
    });
  });

  describe("Rate limiting config", () => {
    it("RATE_LIMIT_MAX_TOKENS is a positive integer", () => {
      expect(Number.isInteger(RATE_LIMIT_MAX_TOKENS)).toBe(true);
      expect(RATE_LIMIT_MAX_TOKENS).toBeGreaterThan(0);
    });

    it("RATE_LIMIT_WINDOW_MS is at least 1 second", () => {
      expect(RATE_LIMIT_WINDOW_MS).toBeGreaterThanOrEqual(1000);
    });

    it("RATE_LIMIT_STALE_MS is greater than RATE_LIMIT_WINDOW_MS", () => {
      // Stale threshold must be larger than the window to avoid premature eviction
      expect(RATE_LIMIT_STALE_MS).toBeGreaterThan(RATE_LIMIT_WINDOW_MS);
    });
  });

  describe("Cache config", () => {
    it("CACHE_MAX_SIZE is a positive integer", () => {
      expect(Number.isInteger(CACHE_MAX_SIZE)).toBe(true);
      expect(CACHE_MAX_SIZE).toBeGreaterThan(0);
    });

    it("CACHE_TTL_MS is at least 1 minute", () => {
      expect(CACHE_TTL_MS).toBeGreaterThanOrEqual(60_000);
    });
  });

  describe("Input limits", () => {
    it("MAX_MESSAGE_LENGTH is at least 100 characters", () => {
      expect(MAX_MESSAGE_LENGTH).toBeGreaterThanOrEqual(100);
    });

    it("MAX_HISTORY_LENGTH is a positive integer", () => {
      expect(Number.isInteger(MAX_HISTORY_LENGTH)).toBe(true);
      expect(MAX_HISTORY_LENGTH).toBeGreaterThan(0);
    });
  });

  describe("Protocol constants", () => {
    it("SSE_DONE_SENTINEL is a non-empty string", () => {
      expect(typeof SSE_DONE_SENTINEL).toBe("string");
      expect(SSE_DONE_SENTINEL.length).toBeGreaterThan(0);
    });

    it("DEFAULT_APP_URL starts with http", () => {
      expect(DEFAULT_APP_URL).toMatch(/^https?:\/\//);
    });
  });
});
