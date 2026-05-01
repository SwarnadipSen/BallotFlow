/**
 * Structured logger for BallotFlow.
 *
 * - In production: outputs JSON to stdout (auto-ingested by Cloud Logging)
 * - In development: pretty-prints with colors and level labels
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Chat request received", { ip: clientIp });
 *   logger.error("Gemini stream failed", { error: err.message });
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogPayload = Record<string, unknown>;

interface LogEntry {
  severity: Uppercase<LogLevel>;
  message: string;
  service: "ballotflow";
  timestamp: string;
  [key: string]: unknown;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Emits a structured log entry.
 * In production this outputs Cloud Logging-compatible JSON.
 */
function log(level: LogLevel, message: string, payload?: LogPayload): void {
  const severity = level.toUpperCase() as Uppercase<LogLevel>;

  if (IS_PRODUCTION) {
    // Cloud Logging JSON format
    const entry: LogEntry = {
      severity,
      message,
      service: "ballotflow",
      timestamp: new Date().toISOString(),
      ...payload,
    };
    // stdout is automatically captured by Cloud Run / Cloud Logging
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    // Developer-friendly colored output
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m", // gray
      info: "\x1b[36m",  // cyan
      warn: "\x1b[33m",  // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const prefix = `${colors[level]}[${severity}]${reset}`;
    const ts = new Date().toLocaleTimeString();
    const payloadStr = payload ? " " + JSON.stringify(payload) : "";
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${ts} ${message}${payloadStr}`);
  }
}

export const logger = {
  debug: (message: string, payload?: LogPayload) => log("debug", message, payload),
  info: (message: string, payload?: LogPayload) => log("info", message, payload),
  warn: (message: string, payload?: LogPayload) => log("warn", message, payload),
  error: (message: string, payload?: LogPayload) => log("error", message, payload),
} as const;
