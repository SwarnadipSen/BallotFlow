"use client";

/**
 * Animated three-dot typing indicator shown while Gemini is generating.
 * Uses CSS animation — no JS timers needed.
 */
export function TypingIndicator() {
  return (
    <div
      className="message-ai"
      role="status"
      aria-label="AI is generating a response"
      aria-live="polite"
      style={{ marginBottom: "1rem" }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--color-primary-light)",
          fontWeight: 500,
          display: "block",
          marginBottom: "0.5rem",
        }}
      >
        Ballot Guide
      </span>
      <div
        style={{ display: "flex", gap: "4px", alignItems: "center" }}
        aria-hidden="true"
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
