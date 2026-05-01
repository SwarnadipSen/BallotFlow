/**
 * Input sanitization utilities.
 * Prevents prompt injection and XSS attacks before passing user input to Gemini.
 */

/** Maximum allowed characters per user message */
const MAX_MESSAGE_LENGTH = 2000;

/** Patterns that suggest prompt injection attempts */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /forget\s+(everything|all)\s+(you\s+know|above)/i,
  /act\s+as\s+(if\s+you\s+are|a)\s+/i,
  /system\s*:\s*you\s+are/i,
  /<\s*script\s*>/i,
  /javascript\s*:/i,
];

/**
 * Sanitizes user chat input before sending to Gemini.
 * - Trims whitespace
 * - Enforces length limits
 * - Detects prompt injection patterns
 * - Strips HTML tags
 *
 * @returns Sanitized string, or null if input is invalid/dangerous
 */
export function sanitizeUserMessage(input: string): {
  sanitized: string | null;
  error?: string;
} {
  if (!input || typeof input !== "string") {
    return { sanitized: null, error: "Message must be a non-empty string." };
  }

  // Trim whitespace
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

  // Strip HTML tags to prevent XSS
  const stripped = trimmed.replace(/<[^>]*>/g, "");

  // Check for prompt injection patterns
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
 * Validates chat history array before passing to Gemini.
 * Ensures each message has correct role and non-empty text.
 */
export function validateChatHistory(
  history: unknown[]
): { valid: boolean; error?: string } {
  if (!Array.isArray(history)) {
    return { valid: false, error: "History must be an array." };
  }

  if (history.length > 50) {
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

    const msg = message as { role: unknown; parts: unknown };
    if (msg.role !== "user" && msg.role !== "model") {
      return { valid: false, error: "Invalid role in message history." };
    }

    if (!Array.isArray(msg.parts)) {
      return { valid: false, error: "Message parts must be an array." };
    }
  }

  return { valid: true };
}
