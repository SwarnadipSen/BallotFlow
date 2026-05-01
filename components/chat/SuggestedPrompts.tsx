"use client";

import type { SuggestedPrompt } from "@/types";

interface SuggestedPromptsProps {
  prompts: SuggestedPrompt[];
  onSelect: (text: string) => void;
}

/**
 * Grid of clickable suggestion chips shown on the empty chat screen.
 * Each chip fires `onSelect` with the prompt text when clicked or activated
 * via keyboard (Enter/Space handled natively by button role).
 */
export function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "0.75rem",
        textAlign: "left",
      }}
      role="list"
      aria-label="Suggested questions"
    >
      {prompts.map((prompt) => (
        <button
          key={prompt.text}
          onClick={() => onSelect(prompt.text)}
          role="listitem"
          aria-label={`Ask: ${prompt.text}`}
          className="suggestion-chip"
          style={{
            padding: "0.875rem 1rem",
            textAlign: "left",
            cursor: "pointer",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
            fontFamily: "var(--font-family)",
            transition: "all var(--transition-base)",
          }}
        >
          <span style={{ fontSize: "1.25rem" }} aria-hidden="true">
            {prompt.emoji}
          </span>
          {prompt.text}
        </button>
      ))}
    </div>
  );
}
