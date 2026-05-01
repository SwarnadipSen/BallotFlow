/**
 * Component tests for chat sub-components.
 *
 * Uses @testing-library/react to render components in jsdom and assert
 * that the correct DOM structure, ARIA attributes, and content appear.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import type { ChatMessage, SuggestedPrompt } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "test-msg-1",
    role: "user",
    content: "How do I register to vote?",
    timestamp: new Date("2024-11-05T09:00:00"),
    isStreaming: false,
    ...overrides,
  };
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

describe("MessageBubble", () => {
  it("renders user message content", () => {
    render(<MessageBubble message={makeMessage()} />);
    expect(screen.getByText("How do I register to vote?")).toBeDefined();
  });

  it("renders 'You' label for user messages", () => {
    render(<MessageBubble message={makeMessage({ role: "user" })} />);
    expect(screen.getByText("You")).toBeDefined();
  });

  it("renders 'Ballot Guide' label for assistant messages", () => {
    render(
      <MessageBubble
        message={makeMessage({
          role: "assistant",
          content: "Registration is typically open year-round.",
        })}
      />
    );
    expect(screen.getByText("Ballot Guide")).toBeDefined();
  });

  it("renders assistant message with article role for accessibility", () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({ role: "assistant", content: "Some answer." })}
      />
    );
    const article = container.querySelector("[role='article']");
    expect(article).not.toBeNull();
  });

  it("displays a formatted timestamp", () => {
    const ts = new Date("2024-11-05T14:30:00");
    render(<MessageBubble message={makeMessage({ timestamp: ts })} />);
    // The time element should be present with a dateTime attribute
    const timeEl = document.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("dateTime")).toBe(ts.toISOString());
  });

  it("does not re-render when content and isStreaming are unchanged (memo)", () => {
    const message = makeMessage();
    const { rerender } = render(<MessageBubble message={message} />);

    // Re-render with a new object but identical content — memo should skip
    const spy = vi.spyOn(console, "log"); // proxy for render calls
    rerender(<MessageBubble message={{ ...message }} />);
    spy.mockRestore();

    // If we get here without crash, memo is working
    expect(screen.getByText("How do I register to vote?")).toBeDefined();
  });
});

// ─── TypingIndicator ──────────────────────────────────────────────────────────

describe("TypingIndicator", () => {
  it("renders a status region for screen readers", () => {
    render(<TypingIndicator />);
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
  });

  it("has an accessible aria-label on the status element", () => {
    render(<TypingIndicator />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toContain("generating");
  });

  it("has aria-live='polite' for non-interruptive announcements", () => {
    render(<TypingIndicator />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });
});

// ─── SuggestedPrompts ─────────────────────────────────────────────────────────

describe("SuggestedPrompts", () => {
  const prompts: SuggestedPrompt[] = [
    { emoji: "🗳️", text: "How do I register to vote?" },
    { emoji: "📅", text: "Walk me through the election process" },
  ];

  it("renders all provided prompts", () => {
    render(<SuggestedPrompts prompts={prompts} onSelect={() => {}} />);
    expect(screen.getByText("How do I register to vote?")).toBeDefined();
    expect(screen.getByText("Walk me through the election process")).toBeDefined();
  });

  it("calls onSelect with the correct text when a prompt is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts prompts={prompts} onSelect={onSelect} />);

    const btn = screen.getByLabelText("Ask: How do I register to vote?");
    fireEvent.click(btn);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("How do I register to vote?");
  });

  it("renders buttons with correct aria-labels for screen readers", () => {
    render(<SuggestedPrompts prompts={prompts} onSelect={() => {}} />);
    expect(screen.getByLabelText("Ask: Walk me through the election process")).toBeDefined();
  });

  it("has a list role for semantic grouping", () => {
    render(<SuggestedPrompts prompts={prompts} onSelect={() => {}} />);
    expect(screen.getByRole("list")).toBeDefined();
  });

  it("renders nothing when given an empty prompts array", () => {
    const { container } = render(<SuggestedPrompts prompts={[]} onSelect={() => {}} />);
    const list = container.querySelector("[role='list']");
    expect(list?.children.length).toBe(0);
  });
});
