"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";

/* ─── Glossary Data ──────────────────────────────────────────────────────── */

const GLOSSARY_TERMS = [
  {
    term: "Absentee Ballot",
    category: "Voting Methods",
    definition:
      "A ballot cast by a voter who is unable to attend the polling place on Election Day. It is usually mailed to the voter and returned by mail or dropped off before election day.",
  },
  {
    term: "Ballot",
    category: "Core Concepts",
    definition:
      "The official document or electronic form used by voters to make their choices in an election. Ballots list all candidates and/or measures being voted on.",
  },
  {
    term: "Canvassing",
    category: "Vote Counting",
    definition:
      "The official process of verifying and counting all ballots after an election closes. Canvassing includes checking signatures on mail-in ballots, validating provisional ballots, and tallying results.",
  },
  {
    term: "Certification",
    category: "Vote Counting",
    definition:
      "The official, formal declaration that election results are final and accurate. Election officials sign off on certified results after canvassing is complete and any recounts have been performed.",
  },
  {
    term: "Constituency",
    category: "Electoral Systems",
    definition:
      "A geographic area or group of people represented by an elected official. Voters in a constituency elect one or more representatives to a legislative body.",
  },
  {
    term: "Early Voting",
    category: "Voting Methods",
    definition:
      "In-person voting that takes place before Election Day at designated polling locations. Early voting periods typically last several days or weeks and allow voters to cast ballots at their convenience.",
  },
  {
    term: "Electoral College",
    category: "Electoral Systems",
    definition:
      "A body of electors established by the United States Constitution who formally elect the President and Vice President. Each state has electors equal to its total Congressional representation.",
  },
  {
    term: "Electoral Roll",
    category: "Core Concepts",
    definition:
      "Also called the voters register or electoral register, this is the official list of all eligible voters in a jurisdiction. Voters must be on the electoral roll to cast a ballot.",
  },
  {
    term: "First-Past-The-Post (FPTP)",
    category: "Electoral Systems",
    definition:
      "A voting system in which the candidate with the most votes wins, even without a majority. Also called plurality voting. Used in the US, UK, Canada, and India for most elections.",
  },
  {
    term: "Gerrymandering",
    category: "Electoral Systems",
    definition:
      "The manipulation of electoral district boundaries to favor a particular party or group. Named after Governor Elbridge Gerry who signed a bill creating an oddly shaped district in 1812.",
  },
  {
    term: "Incumbent",
    category: "Core Concepts",
    definition:
      "A person currently holding a political office who is running for re-election in the same position.",
  },
  {
    term: "Lame Duck",
    category: "Core Concepts",
    definition:
      "An elected official who is serving out the remainder of their term after their successor has been elected. Their power is considered limited as they will soon leave office.",
  },
  {
    term: "Mail-In Voting",
    category: "Voting Methods",
    definition:
      "A process that allows registered voters to receive and return their ballots by mail. Some states/countries conduct all elections entirely by mail.",
  },
  {
    term: "Midterm Election",
    category: "Core Concepts",
    definition:
      "In the United States, elections held in the middle of a presidential term (every 4 years) to elect members of Congress. Midterms are significant because they can shift the balance of power in Congress.",
  },
  {
    term: "Plurality",
    category: "Electoral Systems",
    definition:
      "Receiving more votes than any other candidate, but not necessarily a majority (more than half). A candidate can win with a plurality in many electoral systems.",
  },
  {
    term: "Polling Place",
    category: "Core Concepts",
    definition:
      "A designated location where voters go to cast their ballots on Election Day. Also called a polling station or voting precinct.",
  },
  {
    term: "Primary Election",
    category: "Core Concepts",
    definition:
      "A preliminary election held to choose candidates from within a political party who will then compete in the general election. Primaries can be open (any voter), closed (party members only), or semi-closed.",
  },
  {
    term: "Proportional Representation",
    category: "Electoral Systems",
    definition:
      "An electoral system where parties gain seats in proportion to the number of votes they receive. If a party gets 30% of votes, they get approximately 30% of seats.",
  },
  {
    term: "Provisional Ballot",
    category: "Voting Methods",
    definition:
      "A ballot cast when there is a question about a voter's eligibility — for example, if they're not on the voter roll. Provisional ballots are counted after election officials verify the voter's registration status.",
  },
  {
    term: "Ranked Choice Voting (RCV)",
    category: "Electoral Systems",
    definition:
      "A voting system where voters rank candidates in order of preference (1st, 2nd, 3rd, etc.). If no candidate has a majority, the last-place candidate is eliminated and their votes transferred to voters' next preference. Also called Instant-Runoff Voting.",
  },
  {
    term: "Recount",
    category: "Vote Counting",
    definition:
      "A repeat tabulation of votes cast in an election. Recounts are typically triggered automatically when the margin of victory is very small, or can be requested by a losing candidate.",
  },
  {
    term: "Run-Off Election",
    category: "Core Concepts",
    definition:
      "A second election held between the top candidates when no candidate wins a required threshold (usually a majority) in the first election.",
  },
  {
    term: "Swing State",
    category: "Electoral Systems",
    definition:
      "In U.S. presidential elections, a state where neither major political party has overwhelming support. These states are highly competitive and often determine the outcome of the election.",
  },
  {
    term: "Voter ID Laws",
    category: "Core Concepts",
    definition:
      "Laws requiring voters to present identification before voting. Types of acceptable ID and strictness vary widely by jurisdiction, from signature verification to government-issued photo ID.",
  },
  {
    term: "Voter Registration",
    category: "Core Concepts",
    definition:
      "The process by which a citizen officially signs up with their government to be eligible to vote. Requirements, deadlines, and processes vary by country and state.",
  },
  {
    term: "Voter Suppression",
    category: "Core Concepts",
    definition:
      "Strategies used to discourage or prevent specific groups of people from voting. This can include restrictive ID laws, reducing polling locations, purging voter rolls, or intimidation.",
  },
];

const CATEGORIES = [
  "All",
  ...Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category))).sort(),
];

const CATEGORY_COLORS: Record<string, string> = {
  "Core Concepts": "#6366f1",
  "Electoral Systems": "#06b6d4",
  "Voting Methods": "#22c55e",
  "Vote Counting": "#f59e0b",
};

/* ─── Glossary Page ──────────────────────────────────────────────────────── */

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch =
        searchQuery === "" ||
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || term.category === activeCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, activeCategory]);

  return (
    <main className="bg-mesh" style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
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
          🗳️ Election <span className="text-gradient">Glossary</span>
        </span>
      </header>

      <div className="container-app">
        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            Election <span className="text-gradient">Glossary</span>
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1.0625rem",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {GLOSSARY_TERMS.length} election terms explained in plain language
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            position: "relative",
            maxWidth: "560px",
            margin: "0 auto 2rem",
          }}
        >
          <label htmlFor="glossary-search" className="sr-only">
            Search election terms
          </label>
          <Search
            size={18}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            id="glossary-search"
            type="search"
            placeholder="Search terms (e.g. ranked choice, absentee...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search election glossary terms"
            style={{
              width: "100%",
              padding: "0.875rem 1rem 0.875rem 3rem",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-bright)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-text-primary)",
              fontSize: "0.9375rem",
              fontFamily: "var(--font-family)",
              outline: "none",
              transition: "border-color var(--transition-fast)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-primary)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--color-border-bright)")
            }
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filters */}
        <div
          role="group"
          aria-label="Filter by category"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
            marginBottom: "2.5rem",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const color = CATEGORY_COLORS[cat] ?? "var(--color-primary)";
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={isActive}
                style={{
                  padding: "0.375rem 1rem",
                  borderRadius: "var(--radius-full)",
                  border: isActive
                    ? `1px solid ${color}`
                    : "1px solid var(--color-border)",
                  background: isActive ? `${color}20` : "var(--color-bg-card)",
                  color: isActive ? color : "var(--color-text-secondary)",
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  fontFamily: "var(--font-family)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
          {searchQuery && ` for "${searchQuery}"`}
        </p>

        {/* Terms grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1rem",
          }}
          role="list"
          aria-label="Glossary terms"
        >
          {filteredTerms.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "4rem 2rem",
                color: "var(--color-text-muted)",
              }}
            >
              <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                No terms found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p style={{ fontSize: "0.875rem" }}>
                Try a different search or{" "}
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    `What does ${searchQuery} mean in elections?`
                  )}`}
                  style={{ color: "var(--color-primary-light)" }}
                >
                  ask our AI guide
                </Link>
              </p>
            </div>
          ) : (
            filteredTerms.map((term, i) => {
              const color =
                CATEGORY_COLORS[term.category] ?? "var(--color-primary)";
              return (
                <motion.article
                  key={term.term}
                  role="listitem"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
                  className="glass-card"
                  style={{ padding: "1.25rem" }}
                  aria-labelledby={`term-${term.term.replace(/\s+/g, "-")}`}
                >
                  {/* Category badge */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color,
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      padding: "0.2em 0.6em",
                      borderRadius: "var(--radius-full)",
                      marginBottom: "0.625rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {term.category}
                  </span>

                  <h2
                    id={`term-${term.term.replace(/\s+/g, "-")}`}
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "0.625rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {term.term}
                  </h2>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.65,
                      marginBottom: "1rem",
                    }}
                  >
                    {term.definition}
                  </p>

                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `Explain ${term.term} in more detail`
                    )}`}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-primary-light)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      textDecoration: "none",
                    }}
                    aria-label={`Ask AI about ${term.term}`}
                  >
                    <MessageCircle size={11} aria-hidden="true" />
                    Ask AI for more detail
                  </Link>
                </motion.article>
              );
            })
          )}
        </div>
      </div>

      {/* Screen reader only */}
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}</style>
    </main>
  );
}
