"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CalendarDays } from "lucide-react";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
      style={{ paddingTop: "7rem", paddingBottom: "6rem" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
  );
}
