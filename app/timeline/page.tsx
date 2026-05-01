"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Flag, AlertCircle } from "lucide-react";

/* ─── Timeline Data ──────────────────────────────────────────────────────── */

const TIMELINE_PHASES = [
  {
    phase: "Before the Election",
    color: "#6366f1",
    bgColor: "rgba(99,102,241,0.1)",
    steps: [
      {
        step: 1,
        title: "Voter Registration Opens",
        description:
          "Election authorities open voter registration. Citizens must register by a deadline (varies by country/state — typically 15–30 days before election day). You'll need proof of identity and citizenship.",
        icon: "📋",
        timeframe: "Months before election",
        tips: [
          "Check your country's official election authority website",
          "Update registration if you've moved",
          "Some places allow same-day registration",
        ],
      },
      {
        step: 2,
        title: "Candidates File & Primaries",
        description:
          "Candidates formally declare their candidacy and file required paperwork. Primary elections (in systems that use them) narrow down party candidates before the general election.",
        icon: "🏛️",
        timeframe: "Months before election",
        tips: [
          "Primaries are often held months before the general election",
          "Not all countries use primary systems",
        ],
      },
      {
        step: 3,
        title: "Campaign Period",
        description:
          "Registered candidates campaign to voters through speeches, debates, advertisements, and community events. Voters research candidates and issues.",
        icon: "📢",
        timeframe: "Weeks to months before election",
        tips: [
          "Attend local debates or town halls",
          "Research candidates on official government sources",
          "Check voter guides published by nonpartisan organizations",
        ],
      },
      {
        step: 4,
        title: "Absentee & Early Voting Begins",
        description:
          "Many jurisdictions offer early in-person voting and mail-in/absentee ballots for voters who cannot vote on Election Day. Applications for mail-in ballots often have separate deadlines.",
        icon: "📬",
        timeframe: "2–4 weeks before election",
        tips: [
          "Request mail-in ballot well in advance",
          "Follow all instructions exactly — errors can invalidate your ballot",
          "Track your mail-in ballot status online",
        ],
      },
    ],
  },
  {
    phase: "Election Day",
    color: "#06b6d4",
    bgColor: "rgba(6,182,212,0.1)",
    steps: [
      {
        step: 5,
        title: "Polls Open",
        description:
          "Polling stations open — typically from early morning to evening (hours vary by jurisdiction). Voters go to their designated polling place to cast their ballots in person.",
        icon: "🗳️",
        timeframe: "Election Day morning",
        tips: [
          "Find your polling place at your election authority's website",
          "Bring required ID (varies by jurisdiction)",
          "If there's a long line when polls close, you still have the right to vote",
        ],
      },
      {
        step: 6,
        title: "Voting Process",
        description:
          "Voters check in, verify identity, receive their ballot, mark their choices privately, and submit the ballot. Election officials ensure the process is secure and accessible.",
        icon: "✅",
        timeframe: "During Election Day",
        tips: [
          "Voting is private — no one can tell you who to vote for",
          "Assistance is available for voters with disabilities",
          "Provisional ballots are available if your registration is in question",
        ],
      },
      {
        step: 7,
        title: "Polls Close & Initial Count Begins",
        description:
          "Polling stations close and officials begin counting ballots — in-person votes first, then mail-in/absentee ballots. Results are reported progressively throughout the night.",
        icon: "🔢",
        timeframe: "Election Day evening",
        tips: [
          "Mail-in ballots often take longer to count",
          "Early results may not reflect the final outcome",
          "Official results are not declared until certification",
        ],
      },
    ],
  },
  {
    phase: "After the Election",
    color: "#22c55e",
    bgColor: "rgba(34,197,94,0.1)",
    steps: [
      {
        step: 8,
        title: "Vote Counting & Canvassing",
        description:
          "All ballots (in-person, mail-in, provisional, overseas) are counted and verified. This process is called canvassing. Election officials verify signatures, check for duplicates, and ensure each ballot is valid.",
        icon: "📊",
        timeframe: "Days to weeks after election",
        tips: [
          "Canvassing is a public process — observers from both parties are present",
          "Provisional ballots are checked last",
          "Overseas military ballots have extended deadlines",
        ],
      },
      {
        step: 9,
        title: "Certification",
        description:
          "Election officials formally certify the results after all votes are counted and any audits or recounts are complete. Certification makes the results official.",
        icon: "📜",
        timeframe: "Weeks after election",
        tips: [
          "Candidates can request recounts (often only if the margin is very small)",
          "Certification timelines vary by jurisdiction",
          "Certified results are public record",
        ],
      },
      {
        step: 10,
        title: "Transition & Inauguration",
        description:
          "The winning candidate(s) begin the transition to office. In executive elections, the outgoing officeholder cooperates in transferring power. The inauguration or swearing-in ceremony marks the official start of the new term.",
        icon: "🎖️",
        timeframe: "Weeks to months after election",
        tips: [
          "The length of transition varies by country and office",
          "Some positions take effect immediately after certification",
        ],
      },
    ],
  },
];

/* ─── Step Card ──────────────────────────────────────────────────────────── */

function TimelineStep({
  step,
  phaseColor,
  index,
  isLast,
}: {
  step: (typeof TIMELINE_PHASES)[0]["steps"][0];
  phaseColor: string;
  index: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{ display: "flex", gap: "1.25rem", position: "relative" }}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "1.25rem",
            top: "3rem",
            bottom: "-1rem",
            width: "2px",
            background: `linear-gradient(to bottom, ${phaseColor}60, transparent)`,
          }}
        />
      )}

      {/* Step number dot */}
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          background: `${phaseColor}20`,
          border: `2px solid ${phaseColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "0.75rem",
          fontWeight: 800,
          color: phaseColor,
          zIndex: 1,
          boxShadow: `0 0 16px ${phaseColor}30`,
        }}
        aria-hidden="true"
      >
        {step.step}
      </div>

      {/* Card */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          marginBottom: "1.25rem",
          overflow: "hidden",
          transition: "all var(--transition-base)",
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={`step-details-${step.step}`}
          style={{
            width: "100%",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-family)",
          }}
        >
          <span
            style={{ fontSize: "1.5rem", flexShrink: 0 }}
            role="img"
            aria-label={step.title}
          >
            {step.icon}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.25rem",
              }}
            >
              {step.title}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: phaseColor,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Clock size={11} aria-hidden="true" />
              {step.timeframe}
            </div>
          </div>
          <div
            style={{
              color: "var(--color-text-muted)",
              transition: "transform var(--transition-fast)",
              transform: expanded ? "rotate(180deg)" : "none",
              fontSize: "0.75rem",
            }}
            aria-hidden="true"
          >
            ▼
          </div>
        </button>

        {/* Expandable details */}
        <div
          id={`step-details-${step.step}`}
          style={{
            maxHeight: expanded ? "500px" : "0",
            overflow: "hidden",
            transition: "max-height 0.35s ease",
          }}
          aria-hidden={!expanded}
        >
          <div
            style={{
              padding: "0 1.25rem 1.25rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1rem",
            }}
          >
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              {step.description}
            </p>
            {step.tips.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.5rem",
                  }}
                >
                  💡 Key Tips
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {step.tips.map((tip) => (
                    <li
                      key={tip}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <CheckCircle2
                        size={13}
                        style={{
                          color: phaseColor,
                          flexShrink: 0,
                          marginTop: "0.2rem",
                        }}
                        aria-hidden="true"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Timeline Page ──────────────────────────────────────────────────────── */

export default function TimelinePage() {
  return (
    <main className="bg-mesh" style={{ minHeight: "100vh", padding: "0 0 4rem" }}>
      {/* Header */}
      <header
        className="glass"
        style={{
          padding: "0 1.5rem",
          height: "4rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "3rem",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          className="btn-secondary"
          style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem" }}
          aria-label="Back to home"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Home
        </Link>
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>
          🗳️ Election <span className="text-gradient">Timeline</span>
        </span>
      </header>

      <div className="container-app">
        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900,
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              The Complete{" "}
              <span className="text-gradient">Election Timeline</span>
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1.0625rem",
                maxWidth: "560px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              From voter registration to inauguration — every step of the
              election process explained clearly. Click any step to expand
              details and tips.
            </p>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "var(--radius-md)",
            marginBottom: "3rem",
          }}
          role="note"
          aria-label="Important disclaimer"
        >
          <AlertCircle
            size={18}
            style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }}
            aria-hidden="true"
          />
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            <strong style={{ color: "#fbbf24" }}>Note:</strong> Election
            timelines, deadlines, and procedures vary significantly by country,
            state, and election type. This timeline shows general steps common
            to most democratic elections. Always verify specific dates and
            requirements with your official election authority.
          </p>
        </motion.div>

        {/* Phases */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {TIMELINE_PHASES.map((phase) => (
            <section key={phase.phase} aria-labelledby={`phase-${phase.phase.replace(/\s+/g, "-")}`}>
              {/* Phase header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.75rem",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: phase.color,
                    opacity: 0.3,
                  }}
                  aria-hidden="true"
                />
                <div
                  id={`phase-${phase.phase.replace(/\s+/g, "-")}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1.25rem",
                    background: phase.bgColor,
                    border: `1px solid ${phase.color}40`,
                    borderRadius: "var(--radius-full)",
                    color: phase.color,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    flexShrink: 0,
                  }}
                >
                  <Flag size={13} aria-hidden="true" />
                  {phase.phase}
                </div>
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: phase.color,
                    opacity: 0.3,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Steps */}
              <div>
                {phase.steps.map((step, i) => (
                  <TimelineStep
                    key={step.step}
                    step={step}
                    phaseColor={phase.color}
                    index={i}
                    isLast={i === phase.steps.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Ask AI CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: "4rem",
            textAlign: "center",
            padding: "3rem",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))",
            border: "1px solid var(--color-border-bright)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <h2 style={{ fontWeight: 800, fontSize: "1.375rem", marginBottom: "0.75rem" }}>
            Have a question about any step?
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            Our AI Ballot Guide can answer any specific question about your
            election process.
          </p>
          <Link href="/chat" className="btn-primary">
            Ask the AI Guide →
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
