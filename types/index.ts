/**
 * Shared TypeScript types for BallotFlow.
 * All domain-level interfaces and type aliases live here.
 * Never duplicate type definitions across files — import from this module.
 */

// ─── Gemini / AI ──────────────────────────────────────────────────────────────

/**
 * A single message in the Gemini chat history format.
 * "model" is Gemini's term for the assistant role.
 */
export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

// ─── UI Constants ─────────────────────────────────────────────────────────────

export const UI_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type UIRole = (typeof UI_ROLES)[keyof typeof UI_ROLES];

// ─── Chat UI ──────────────────────────────────────────────────────────────────

/** A message as represented in the React UI state */
export interface ChatMessage {
  id: string;
  role: UIRole;
  content: string;
  timestamp: Date;
  /** True while the AI is still streaming tokens for this message */
  isStreaming?: boolean;
}

/** A single suggested prompt shown on the empty chat screen */
export interface SuggestedPrompt {
  emoji: string;
  text: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/** Shape of the request body sent to POST /api/chat */
export interface ChatRequestBody {
  message: string;
  history?: GeminiMessage[];
}

/** Successful SSE chunk from the streaming response */
export interface StreamChunk {
  text?: string;
  error?: string;
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

// ─── Firestore / Sessions ─────────────────────────────────────────────────────

export interface StoredMessage {
  role: "user" | "model";
  text: string;
  timestamp: string; // ISO string — Firestore doesn't store Date objects natively
}

/** Structural type for Firestore Timestamps (works for both client and admin SDKs) */
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
};

export interface ChatSession {
  id: string;
  userId: string;
  createdAt: FirestoreTimestamp;
  messages: StoredMessage[];
}

// ─── Sanitization ─────────────────────────────────────────────────────────────

export interface SanitizeResult {
  sanitized: string | null;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
