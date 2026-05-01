import { describe, it, expect, beforeEach } from "vitest";
import {
  getCachedResponse,
  setCachedResponse,
  getCacheSize,
} from "@/lib/responseCache";

/** A unique prefix ensures these tests don't share state with each other */
const prefix = `cache-test-${Date.now()}`;

describe("responseCache — getCachedResponse / setCachedResponse", () => {
  it("returns null for an uncached message", () => {
    expect(getCachedResponse(`${prefix}-miss`)).toBeNull();
  });

  it("stores and retrieves a response", () => {
    const msg = `${prefix}-store`;
    const response = "Voter registration typically closes 15-30 days before an election.";

    setCachedResponse(msg, response);
    expect(getCachedResponse(msg)).toBe(response);
  });

  it("is case-insensitive and trims whitespace on lookup", () => {
    const base = `${prefix}-normalize`;
    setCachedResponse(base, "Some answer");

    // Should match regardless of casing or surrounding spaces
    expect(getCachedResponse(base.toUpperCase())).toBe("Some answer");
    expect(getCachedResponse(`  ${base}  `)).toBe("Some answer");
  });

  it("overwrites an existing entry for the same message", () => {
    const msg = `${prefix}-overwrite`;
    setCachedResponse(msg, "First answer");
    setCachedResponse(msg, "Updated answer");
    expect(getCachedResponse(msg)).toBe("Updated answer");
  });

  it("stores multiple distinct messages independently", () => {
    const msgA = `${prefix}-multi-a`;
    const msgB = `${prefix}-multi-b`;
    setCachedResponse(msgA, "Answer A");
    setCachedResponse(msgB, "Answer B");

    expect(getCachedResponse(msgA)).toBe("Answer A");
    expect(getCachedResponse(msgB)).toBe("Answer B");
  });

  it("does not cross-contaminate similar messages", () => {
    const msg1 = `${prefix}-similar How do I register?`;
    const msg2 = `${prefix}-similar How do I vote?`;
    setCachedResponse(msg1, "Registration answer");
    setCachedResponse(msg2, "Voting answer");

    expect(getCachedResponse(msg1)).toBe("Registration answer");
    expect(getCachedResponse(msg2)).toBe("Voting answer");
  });
});

describe("responseCache — getCacheSize", () => {
  it("returns a non-negative integer", () => {
    const size = getCacheSize();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThanOrEqual(0);
  });

  it("increments after a new entry is added", () => {
    const before = getCacheSize();
    setCachedResponse(`${prefix}-size-check-${Math.random()}`, "answer");
    expect(getCacheSize()).toBe(before + 1);
  });
});
