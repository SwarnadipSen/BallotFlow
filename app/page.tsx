"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CalendarDays,
  BookOpen,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Chat Guide",
    description:
      "Ask any election question in plain language. Powered by Google Gemini with real-time streaming answers.",
    color: "var(--color-primary)",
  },
  {
    icon: CalendarDays,
    title: "Election Timeline",
    description:
      "Step-by-step visual timeline of the entire election process — from registration to certification.",
    color: "var(--color-accent)",
  },
  {
    icon: BookOpen,
    title: "Civic Glossary",
    description:
      "Searchable dictionary of every election term — ballot types, electoral systems, voting methods.",
    color: "#22c55e",
  },
  {
    icon: Shield,
    title: "Non-Partisan",
    description:
      "Strictly factual and impartial. No candidate endorsements, no political bias. Just civic facts.",
    color: "#f59e0b",
  },
  {
    icon: Zap,
    title: "Instant Answers",
    description:
      "Streaming AI responses appear token by token — no waiting for long answers to generate.",
    color: "#ec4899",
  },
  {
    icon: Globe,
    title: "Any Country",
    description:
      "Covers election processes worldwide — from parliamentary to presidential systems.",
    color: "#8b5cf6",
  },
];

const EXAMPLE_QUESTIONS = [
  "How do I register to vote?",
  "What is ranked choice voting?",
  "When is the voter registration deadline?",
  "How are mail-in ballots counted?",
  "What happens after Election Day?",
  "How do I find my polling place?",
];

const STATS = [
  { value: "50+", label: "Countries Covered" },
  { value: "100+", label: "Election Questions Answered" },
  { value: "8", label: "Google Services Integrated" },
  { value: "WCAG 2.1", label: "Accessibility Standard" },
];

/* ─── Animation Variants ─────────────────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="bg-mesh min-h-screen">
      {/* ── Navigation ── */}
      <nav
        className="glass sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-app flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl"
              role="img"
              aria-label="Ballot box emoji"
            >
              🗳️
            </span>
            <span
              className="font-bold text-xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              Ballot<span className="text-gradient">Flow</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="btn-primary"
              aria-label="Start chatting with BallotFlow AI assistant"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Start Chatting
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden"
        style={{ paddingTop: "7rem", paddingBottom: "6rem" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80vw",
              height: "60vh",
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="container-app relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass"
              style={{
                border: "1px solid var(--color-border-bright)",
                fontSize: "0.8125rem",
                color: "var(--color-primary-light)",
                fontWeight: 500,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#22c55e" }}
                aria-hidden="true"
              />
              Powered by Google Gemini 2.0 Flash
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: "1.5rem",
              }}
            >
              Understand Every
              <br />
              <span className="text-gradient">Election Step</span>
              <br />
              with AI
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                color: "var(--color-text-secondary)",
                maxWidth: "580px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}
            >
              BallotFlow is your free, non-partisan AI guide to elections.
              Ask anything about voter registration, timelines, ballot types,
              and how your vote counts.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/chat"
                className="btn-primary"
                style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}
                aria-label="Open AI chat to ask election questions"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Ask the AI Guide
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/timeline"
                className="btn-secondary"
                style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}
                aria-label="View interactive election timeline"
              >
                <CalendarDays size={18} aria-hidden="true" />
                View Election Timeline
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section
        aria-label="BallotFlow statistics"
        style={{
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg-surface)",
          padding: "3rem 0",
        }}
      >
        <div className="container-app">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "var(--color-primary-light)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Questions ── */}
      <section
        aria-labelledby="questions-heading"
        style={{ padding: "6rem 0" }}
      >
        <div className="container-app text-center">
          <h2
            id="questions-heading"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            Ask anything about <span className="text-gradient">elections</span>
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "3rem",
              fontSize: "1.0625rem",
            }}
          >
            Our AI guide knows the full election process, from registration
            to results.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "0",
            }}
          >
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <motion.div
                key={q}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Link
                  href={`/chat?q=${encodeURIComponent(q)}`}
                  className="chip-hover"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.125rem",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-full)",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                  aria-label={`Ask: ${q}`}
                >
                  <ChevronRight
                    size={14}
                    style={{ color: "var(--color-primary)" }}
                    aria-hidden="true"
                  />
                  {q}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        aria-labelledby="features-heading"
        style={{
          padding: "7rem 0",
          background: "var(--color-bg-surface)",
        }}
      >
        <div className="container-app">
          <div className="text-center" style={{ marginBottom: "3.5rem" }}>
            <h2
              id="features-heading"
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              Everything you need to
              <span className="text-gradient"> vote confidently</span>
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem" }}>
              Built on Google Cloud with security, accessibility, and accuracy
              at its core.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="glass-card"
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "var(--radius-md)",
                    background: `${feature.color}20`,
                    border: `1px solid ${feature.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                  aria-hidden="true"
                >
                  <feature.icon size={22} style={{ color: feature.color }} />
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.0625rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Google Services Banner ── */}
      <section
        aria-labelledby="google-services-heading"
        style={{ padding: "7rem 0" }}
      >
        <div className="container-app">
          <div
            className="glass-card"
            style={{
              padding: "4rem 3rem",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.05) 100%)",
              border: "1px solid var(--color-border-bright)",
              textAlign: "center",
            }}
          >
            <h2
              id="google-services-heading"
              style={{
                fontSize: "clamp(1.25rem, 3vw, 2rem)",
                fontWeight: 800,
                marginBottom: "0.75rem",
              }}
            >
              Built on{" "}
              <span className="text-gradient">Google Cloud</span>
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                marginBottom: "2rem",
                fontSize: "1rem",
              }}
            >
              8 Google services work together to deliver fast, secure, and
              reliable civic information.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              {[
                "Gemini 2.0 Flash",
                "Cloud Run",
                "Firestore",
                "Firebase Auth",
                "Secret Manager",
                "Cloud Build",
                "Cloud Logging",
                "Search Grounding",
              ].map((service) => (
                <span
                  key={service}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.875rem",
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8125rem",
                    color: "var(--color-primary-light)",
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2
                    size={12}
                    aria-hidden="true"
                    style={{ color: "#22c55e" }}
                  />
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        aria-labelledby="cta-heading"
        style={{
          padding: "8rem 0",
          textAlign: "center",
          background: "var(--color-bg-surface)",
        }}
      >
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="cta-heading"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 900,
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to understand{" "}
              <span className="text-gradient">your election?</span>
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1.125rem",
                marginBottom: "2.5rem",
                maxWidth: "500px",
                margin: "0 auto 2.5rem",
              }}
            >
              Ask your first question now — no sign-up required.
              Your civic journey starts here.
            </p>
            <Link
              href="/chat"
              className="btn-primary"
              style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
              aria-label="Start chatting with BallotFlow AI"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Get Started — It&apos;s Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "3.5rem 0",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div className="container-app">
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <span role="img" aria-label="ballot box" style={{ fontSize: "1.25rem" }}>🗳️</span>
            <span style={{ fontWeight: 700, color: "var(--color-text-secondary)", fontSize: "1rem" }}>
              Ballot<span className="text-gradient">Flow</span>
            </span>
          </div>

          {/* Nav links */}
          <nav
            aria-label="Footer navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <Link href="/chat" className="footer-link">
              Chat
            </Link>
            <Link href="/timeline" className="footer-link">
              Timeline
            </Link>
            <Link href="/glossary" className="footer-link">
              Glossary
            </Link>
          </nav>

          {/* Legal */}
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            Non-partisan civic education powered by{" "}
            <a
              href="https://deepmind.google/technologies/gemini/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary-light)" }}
              aria-label="Google Gemini (opens in new tab)"
            >
              Google Gemini
            </a>
            {" "}· Built for Google Promptwar Challenge 2
          </p>
        </div>
      </footer>
    </main>
  );
}
