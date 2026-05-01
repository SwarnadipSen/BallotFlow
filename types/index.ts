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

// ─── Chat UI ──────────────────────────────────────────────────────────────────

/** A message as represented in the React UI state */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
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

export interface ChatSession {
  id: string;
  userId: string;
  createdAt: unknown; // Firestore Timestamp
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
