"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, RotateCcw, MessageCircle, CalendarDays, BookOpen } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SSE_DONE_SENTINEL } from "@/lib/constants";
import type { ChatMessage, GeminiMessage, SuggestedPrompt, StreamChunk } from "@/types";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { emoji: "🗳️", text: "How do I register to vote?" },
  { emoji: "📅", text: "Walk me through the election process step by step" },
  { emoji: "📬", text: "How does mail-in voting work?" },
  { emoji: "🏛️", text: "What is the Electoral College?" },
  { emoji: "🔢", text: "What is ranked choice voting?" },
  { emoji: "✅", text: "How are votes counted and certified?" },
  { emoji: "📍", text: "How do I find my polling place?" },
  { emoji: "📋", text: "What ID do I need to vote?" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts UI ChatMessages to the Gemini wire format, skipping streaming entries */
function toGeminiHistory(messages: ChatMessage[]): GeminiMessage[] {
  return messages
    .filter((m) => !m.isStreaming)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoised history — only recomputed when messages array changes.
  // Passed to handleSend rather than built inline on every keystroke.
  const geminiHistory = useMemo(
    () => toGeminiHistory(messages),
    [messages]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Pre-fill from URL query param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && messages.length === 0) {
      handleSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-grow textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? inputValue).trim();
      if (!messageText || isLoading) return;

      setInputValue("");
      setError(null);
      setShowSuggestions(false);
      if (inputRef.current) inputRef.current.style.height = "auto";

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const aiMsgId = `ai_${Date.now()}`;
      const aiMsgPlaceholder: ChatMessage = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMsgPlaceholder]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, history: geminiHistory }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(errData.error ?? `Server error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream available.");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === SSE_DONE_SENTINEL) break;

            try {
              const parsed = JSON.parse(data) as StreamChunk;
              if (parsed.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: m.content + parsed.text!, isStreaming: true }
                      : m
                  )
                );
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        // Mark streaming done
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        inputRef.current?.focus();
      }
    },
    [inputValue, isLoading, geminiHistory]
  );

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

  const showTypingIndicator =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  return (
    <div
      className="bg-mesh"
      style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}
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
          <Link href="/" className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem" }} aria-label="Back to home">
            <ArrowLeft size={14} aria-hidden="true" />
            Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span role="img" aria-label="ballot box" style={{ fontSize: "1.25rem" }}>🗳️</span>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>
              Ballot<span className="text-gradient">Flow</span> Chat
            </span>
          </div>
        </div>

        <nav aria-label="Quick navigation" style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/timeline" className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }} aria-label="View election timeline">
            <CalendarDays size={13} aria-hidden="true" />
            Timeline
          </Link>
          <Link href="/glossary" className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }} aria-label="Open election glossary">
            <BookOpen size={13} aria-hidden="true" />
            Glossary
          </Link>
          {messages.length > 0 && (
            <button onClick={handleReset} className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }} aria-label="Start a new conversation">
              <RotateCcw size={13} aria-hidden="true" />
              New Chat
            </button>
          )}
        </nav>
      </header>

      {/* ── Messages ── */}
      <main
        id="chat-messages"
        role="log"
        aria-label="Conversation with Ballot Guide"
        aria-live="polite"
        aria-relevant="additions"
        style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column" }}
      >
        <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", flex: 1 }}>
          {/* Empty state */}
          <AnimatePresence>
            {showSuggestions && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                style={{ paddingTop: "2rem", textAlign: "center" }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }} role="img" aria-label="ballot box">🗳️</div>
                <h1 style={{ fontSize: "1.625rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                  Your <span className="text-gradient">Election Guide</span>
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: "2.5rem", maxWidth: "420px", margin: "0 auto 2.5rem" }}>
                  Ask me anything about elections — voter registration, timelines, ballot types, vote counting, and more.
                </p>
                <SuggestedPrompts prompts={SUGGESTED_PROMPTS} onSelect={handleSend} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {showTypingIndicator && <TypingIndicator />}

          {/* Error */}
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
                  <strong>Error: </strong>{error}
                  <button onClick={() => setError(null)} style={{ display: "block", marginTop: "0.375rem", color: "#fca5a5", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "var(--font-family)" }} aria-label="Dismiss error">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </main>

      {/* ── Input ── */}
      <div className="glass" style={{ padding: "1rem 1.5rem", flexShrink: 0, borderTop: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} aria-label="Chat input form">
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
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-bright)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <label htmlFor="chat-input" className="sr-only">Type your election question</label>
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
                style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", flexShrink: 0, minWidth: "2.5rem" }}
              >
                <Send size={16} aria-hidden="true" />
                <span className="sr-only">Send</span>
              </button>
            </div>

            <p id="chat-hint" style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
              <MessageCircle size={10} style={{ display: "inline", marginRight: "4px" }} aria-hidden="true" />
              BallotFlow is non-partisan and does not endorse any candidate or party. Always verify with your official election authority.
            </p>
          </form>
        </div>
      </div>

      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}</style>
    </div>
  );
}

// Wrap with ErrorBoundary so streaming errors don't crash the whole page
export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatPageInner />
    </ErrorBoundary>
  );
}
