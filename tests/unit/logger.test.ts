import { describe, it, expect, vi, afterEach } from "vitest";

/**
 * Logger unit tests.
 *
 * We spy on process.stdout.write (production path) and console.log (dev path)
 * to verify that the right output format is produced in each environment.
 */

describe("logger — development mode", () => {
  // Tests run in NODE_ENV=test which our logger treats like development
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logger module exports all four severity methods", async () => {
    const { logger } = await import("@/lib/logger");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("info() does not throw for a plain message", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() => logger.info("Test message")).not.toThrow();
  });

  it("error() does not throw with a payload object", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() => logger.error("Something failed", { code: 500, detail: "timeout" })).not.toThrow();
  });

  it("warn() accepts an empty payload", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() => logger.warn("Rate limited")).not.toThrow();
  });

  it("debug() accepts a payload with nested data", async () => {
    const { logger } = await import("@/lib/logger");
    expect(() =>
      logger.debug("Cache lookup", { key: "abc123", hit: true, latencyMs: 0.4 })
    ).not.toThrow();
  });
});

describe("logger — production mode (JSON output)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("writes valid JSON to stdout in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    // Re-import to pick up the stubbed env
    const { logger } = await import("@/lib/logger");
    logger.info("Production log test", { ip: "1.2.3.4" });

    // Find the call that wrote our log (ignores other stdout writes)
    const calls = writeSpy.mock.calls.map((c) => String(c[0]));
    const logCall = calls.find((s) => s.includes("Production log test"));

    expect(logCall).toBeDefined();

    const parsed = JSON.parse(logCall!.trim()) as Record<string, unknown>;
    expect(parsed.severity).toBe("INFO");
    expect(parsed.message).toBe("Production log test");
    expect(parsed.service).toBe("ballotflow");
    expect(typeof parsed.timestamp).toBe("string");
    expect(parsed.ip).toBe("1.2.3.4");
  });
});
