/**
 * Input sanitization utilities.
 *
 * Prevents prompt injection and XSS attacks before passing user input to Gemini.
 * All exported functions are pure (no side effects) for easy unit testing.
 */

import { MAX_MESSAGE_LENGTH, MAX_HISTORY_LENGTH } from "@/lib/constants";
import type { SanitizeResult, ValidationResult, GeminiMessage } from "@/types";

// ─── Injection Detection ──────────────────────────────────────────────────────

/**
 * Patterns that indicate a prompt injection attempt.
 * Checked against the stripped (HTML-removed) message text.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /forget\s+(everything|all)\s+(you\s+know|above)/i,
  /act\s+as\s+(if\s+you\s+are|a)\s+/i,
  /system\s*:\s*you\s+are/i,
  /developer\s*mode/i,
  /debug\s*mode/i,
  /translate\s+the\s+above/i,
  /summarize\s+the\s+above/i,
  /<\s*script\s*>/i,
  /javascript\s*:/i,
  /base64/i,
];

/** Matches any HTML tag */
const HTML_TAG_PATTERN = /<[^>]*>/g;

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Sanitizes a raw user chat message before sending to Gemini.
 *
 * Steps:
 * 1. Type check and trim whitespace
 * 2. Enforce character length limit
 * 3. Strip HTML tags (XSS prevention)
 * 4. Detect prompt injection patterns
 *
 * @returns `{ sanitized }` on success, `{ sanitized: null, error }` on failure
 */
export function sanitizeUserMessage(input: unknown): SanitizeResult {
  if (typeof input !== "string" || input.length === 0) {
    return { sanitized: null, error: "Message must be a non-empty string." };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { sanitized: null, error: "Message cannot be empty." };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      sanitized: null,
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
    };
  }

  // Strip HTML tags
  const stripped = trimmed.replace(HTML_TAG_PATTERN, "");

  // Check for prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(stripped)) {
      return {
        sanitized: null,
        error: "Your message contains content that cannot be processed.",
      };
    }
  }

  return { sanitized: stripped };
}

/**
 * Validates the chat history array before passing it to Gemini.
 *
 * Checks:
 * - Must be an array
 * - Must not exceed MAX_HISTORY_LENGTH entries
 * - Each entry must have a valid `role` ("user" | "model") and `parts` array
 */
export function validateChatHistory(history: unknown): ValidationResult {
  if (!Array.isArray(history)) {
    return { valid: false, error: "History must be an array." };
  }

  if (history.length > MAX_HISTORY_LENGTH) {
    return { valid: false, error: "Chat history too long." };
  }

  for (const message of history) {
    if (
      typeof message !== "object" ||
      message === null ||
      !("role" in message) ||
      !("parts" in message)
    ) {
      return { valid: false, error: "Invalid message format in history." };
    }

    const { role, parts } = message as GeminiMessage;

    if (role !== "user" && role !== "model") {
      return { valid: false, error: "Invalid role in message history." };
    }

    if (!Array.isArray(parts)) {
      return { valid: false, error: "Message parts must be an array." };
    }
  }

  return { valid: true };
}
