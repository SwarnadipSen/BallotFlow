"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  MessageCircle,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/gemini";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

/* ─── Suggested Prompts ──────────────────────────────────────────────────── */

const SUGGESTED_PROMPTS = [
  { emoji: "🗳️", text: "How do I register to vote?" },
  { emoji: "📅", text: "Walk me through the election process step by step" },
  { emoji: "📬", text: "How does mail-in voting work?" },
  { emoji: "🏛️", text: "What is the Electoral College?" },
  { emoji: "🔢", text: "What is ranked choice voting?" },
  { emoji: "✅", text: "How are votes counted and certified?" },
  { emoji: "📍", text: "How do I find my polling place?" },
  { emoji: "📋", text: "What ID do I need to vote?" },
];

/* ─── Streaming Typing Indicator ─────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div
      className="message-ai"
      role="status"
      aria-label="AI is generating a response"
      aria-live="polite"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-primary-light)",
            fontWeight: 500,
          }}
        >
          Ballot Guide
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "0.5rem",
          alignItems: "center",
        }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ─── Message Bubble ─────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "1rem",
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
        aria-label={
          isUser ? undefined : "AI response from Ballot Guide"
        }
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
            {message.isStreaming && (
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
            )}
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
    </motion.div>
  );
}

/* ─── Main Chat Page ─────────────────────────────────────────────────────── */

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle pre-filled query from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && messages.length === 0) {
      handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // Build Gemini-compatible history from messages
  const buildHistory = (msgs: Message[]): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> => {
    return msgs
      .filter((m) => !m.isStreaming)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
  };

  const handleSend = async (text?: string) => {
    const messageText = (text ?? inputValue).trim();
    if (!messageText || isLoading) return;

    setInputValue("");
    setError(null);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Add user message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated;
    });
    setIsLoading(true);

    // Create streaming AI message placeholder
    const aiMsgId = `ai_${Date.now()}`;
    const aiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMsg]);

    // Start streaming
    abortControllerRef.current = new AbortController();

    try {
      const history = buildHistory(messages);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ?? `Server error: ${response.status}`
        );
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      if (!reader) throw new Error("No response stream available.");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: fullContent, isStreaming: true }
                    : m
                )
              );
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch (parseError) {
            if (parseError instanceof SyntaxError) continue;
            throw parseError;
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      // Remove the empty AI message
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setShowSuggestions(true);
    setIsLoading(false);
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="bg-mesh"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        className="glass"
        style={{
          padding: "0 1rem",
          height: "3.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 10,
        }}
        role="banner"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/"
            className="btn-secondary"
            style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem" }}
            aria-label="Back to home"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span role="img" aria-label="ballot box" style={{ fontSize: "1.25rem" }}>🗳️</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--color-text-primary)",
              }}
            >
              Ballot<span className="text-gradient">Flow</span> Chat
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <nav aria-label="Quick navigation" style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href="/timeline"
              className="btn-secondary"
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
              aria-label="View election timeline"
            >
              <CalendarDays size={13} aria-hidden="true" />
              Timeline
            </Link>
            <Link
              href="/glossary"
              className="btn-secondary"
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
              aria-label="Open election glossary"
            >
              <BookOpen size={13} aria-hidden="true" />
              Glossary
            </Link>
          </nav>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="btn-secondary"
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
              aria-label="Start a new conversation"
              title="New conversation"
            >
              <RotateCcw size={13} aria-hidden="true" />
              New Chat
            </button>
          )}
        </div>
      </header>

      {/* ── Messages Area ── */}
      <main
        id="chat-messages"
        role="log"
        aria-label="Conversation with Ballot Guide"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", flex: 1 }}>
          {/* Empty state / Suggested prompts */}
          <AnimatePresence>
            {showSuggestions && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                style={{ paddingTop: "2rem", textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "3.5rem",
                    marginBottom: "1rem",
                  }}
                  role="img"
                  aria-label="ballot box"
                >
                  🗳️
                </div>
                <h1
                  style={{
                    fontSize: "1.625rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                  }}
                >
                  Your <span className="text-gradient">Election Guide</span>
                </h1>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9375rem",
                    marginBottom: "2.5rem",
                    maxWidth: "420px",
                    margin: "0 auto 2.5rem",
                  }}
                >
                  Ask me anything about elections — voter registration,
                  timelines, ballot types, vote counting, and more.
                </p>

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
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="glass-card"
                      role="listitem"
                      aria-label={`Ask: ${prompt.text}`}
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "left",
                        cursor: "pointer",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg-card)",
                        borderRadius: "var(--radius-md)",
                        transition: "all var(--transition-base)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                        fontFamily: "var(--font-family)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--color-primary)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--color-text-primary)";
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--color-text-secondary)";
                        (e.currentTarget as HTMLElement).style.transform =
                          "none";
                      }}
                    >
                      <span style={{ fontSize: "1.25rem" }} aria-hidden="true">
                        {prompt.emoji}
                      </span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator (only when loading and last AI message has content) */}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <TypingIndicator />
            )}

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                role="alert"
                aria-live="assertive"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.875rem 1rem",
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <span aria-hidden="true">⚠️</span>
                <div>
                  <strong>Error: </strong>
                  {error}
                  <button
                    onClick={() => setError(null)}
                    style={{
                      display: "block",
                      marginTop: "0.375rem",
                      color: "#fca5a5",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      fontFamily: "var(--font-family)",
                    }}
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </main>

      {/* ── Input Area ── */}
      <div
        className="glass"
        style={{
          padding: "1rem 1.5rem",
          flexShrink: 0,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            aria-label="Chat input form"
          >
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-end",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-bright)",
                borderRadius: "var(--radius-xl)",
                padding: "0.625rem 0.75rem 0.625rem 1.25rem",
                transition: "border-color var(--transition-fast)",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 0 3px rgba(99,102,241,0.15)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-border-bright)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your election question
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about elections... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                aria-label="Type your election question here"
                aria-describedby="chat-hint"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  resize: "none",
                  fontFamily: "var(--font-family)",
                  minHeight: "1.6em",
                  maxHeight: "160px",
                  overflow: "auto",
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="btn-primary"
                aria-label="Send message"
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  flexShrink: 0,
                  minWidth: "2.5rem",
                }}
              >
                <Send size={16} aria-hidden="true" />
                <span className="sr-only">Send</span>
              </button>
            </div>

            <p
              id="chat-hint"
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              <MessageCircle
                size={10}
                style={{ display: "inline", marginRight: "4px" }}
                aria-hidden="true"
              />
              BallotFlow is non-partisan and does not endorse any candidate or
              party. Always verify with your official election authority.
            </p>
          </form>
        </div>
      </div>

      {/* Screen reader only utility class */}
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}</style>
    </div>
  );
}
