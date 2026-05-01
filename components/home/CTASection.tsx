"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
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
  );
}
