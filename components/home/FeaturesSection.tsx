"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  MessageCircle,
  CalendarDays,
  BookOpen,
  Shield,
  Zap,
  Globe,
  type LucideIcon,
} from "lucide-react";

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

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

export function FeaturesSection() {
  return (
    <>
      {/* ── Example Questions ── */}
      <section aria-labelledby="questions-heading" style={{ padding: "6rem 0" }}>
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
            <p
              style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem" }}
            >
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
    </>
  );
}
