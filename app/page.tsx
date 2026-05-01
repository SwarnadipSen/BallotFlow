import Link from "next/link";
import {
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "50+", label: "Countries Covered" },
  { value: "100+", label: "Election Questions Answered" },
  { value: "8", label: "Google Services Integrated" },
  { value: "WCAG 2.1", label: "Accessibility Standard" },
];

/* ─── Page Component (Server) ────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main id="main-content" className="bg-mesh min-h-screen">
      {/* ── Navigation (Static/Server) ── */}
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

      {/* ── Hero (Client) ── */}
      <HeroSection />

      {/* ── Stats Bar (Server) ── */}
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

      {/* ── Features & Questions (Client) ── */}
      <FeaturesSection />

      {/* ── Google Services Banner (Server) ── */}
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

      {/* ── CTA (Client) ── */}
      <CTASection />

      {/* ── Footer (Server) ── */}
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
