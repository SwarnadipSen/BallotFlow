"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { UI_ROLES, type ChatMessage } from "@/types";

// ─── Typing Cursor ────────────────────────────────────────────────────────────

const StreamingCursor = () => (
  <span
    style={{
      display: "inline-block",
      width: "2px",
      height: "1em",
      background: "var(--color-primary-light)",
      marginLeft: "2px",
      animation: "typing-dot 1s infinite",
      verticalAlign: "text-bottom",
    }}
    aria-hidden="true"
  />
);

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Renders a single chat message bubble.
 *
 * Wrapped in React.memo with a custom comparator:
 * Only re-renders when `content` or `isStreaming` changes.
 * This prevents all previous bubbles from re-rendering on every new token
 * during streaming — a significant performance win on long conversations.
 */
export const MessageBubble = memo(
  function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === UI_ROLES.USER;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          marginBottom: "1rem",
          animation: "fade-in-up 0.25s ease forwards",
        }}
      >
        {/* Role label */}
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            marginBottom: "0.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
          aria-hidden="true"
        >
          {isUser ? "You" : "Ballot Guide"}
        </span>

        {/* Bubble */}
        <div
          className={isUser ? "message-user" : "message-ai"}
          role={isUser ? undefined : "article"}
          aria-label={isUser ? undefined : "AI response from Ballot Guide"}
        >
          {isUser ? (
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {message.content}
            </p>
          ) : (
            <div className="prose-ballot">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && <StreamingCursor />}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <time
          dateTime={message.timestamp.toISOString()}
          style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            marginTop: "0.25rem",
          }}
          aria-label={`Sent at ${message.timestamp.toLocaleTimeString()}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    );
  },
  // Custom comparator — only re-render when content or streaming state changes
  (prev, next) =>
    prev.message.content === next.message.content &&
    prev.message.isStreaming === next.message.isStreaming
);
