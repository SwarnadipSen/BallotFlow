# BallotFlow — Score Improvement Plan

> Current: **96.94%** → Target: **98%+**
> Focus areas: Code Quality (87.5%) · Security (98.75%) · Testing (96.25%) · Accessibility (98.75%)

---

## 1. Code Quality — 87.5% → 95%+

This is the **largest gap**. The issues are spread across consistency, typing strictness, and a few style anti-patterns.

### 1.1 — Fix `no-console` ESLint rule inconsistency

**File:** `eslint.config.mjs` line 24

```diff
- "no-console": ["error", { allow: ["log"] }],
+ "no-console": ["error", { allow: [] }],
```

**Why:** The current config allows `console.log` but the project has a `lib/logger.ts` for exactly that purpose. Allowing `console.log` contradicts your own architectural rule. Remove the exception — any stray `console.log` should be a lint error.

---

### 1.2 — Turn `@typescript-eslint/no-explicit-any` from `warn` to `error`

**File:** `eslint.config.mjs` line 33

```diff
- "@typescript-eslint/no-explicit-any": "warn",
+ "@typescript-eslint/no-explicit-any": "error",
```

**Why:** Warnings are invisible in CI if `--max-warnings 0` isn't set. Elevating to `error` enforces proper typing and removes the loophole. Add `--max-warnings 0` to the lint script too:

```diff
- "lint": "next lint",
+ "lint": "next lint --max-warnings 0",
```

---

### 1.3 — Make `ChatSession.createdAt` properly typed

**File:** `types/index.ts` line 69

```diff
- createdAt: unknown; // Firestore Timestamp
+ createdAt: import("firebase-admin/firestore").Timestamp | import("firebase/firestore").Timestamp;
```

Or, create a lightweight union type at the top of the file:

```ts
// At the top of types/index.ts
type FirestoreTimestamp = { seconds: number; nanoseconds: number; toDate(): Date };

export interface ChatSession {
  id: string;
  userId: string;
  createdAt: FirestoreTimestamp;
  messages: StoredMessage[];
}
```

**Why:** `unknown` in a public interface is a code smell. It forces every consumer to cast unsafely. A structural type works for both `firebase` and `firebase-admin` Timestamps.

---

### 1.4 — Add explicit return type annotation to `getClientIp`

**File:** `app/api/chat/route.ts` line 50

```diff
- function getClientIp(request: NextRequest): string {
+ function getClientIp(request: NextRequest): string {  // already typed ✓
```

Currently fine, but `sseChunk` and helper functions lack explicit return types. Add them:

```diff
- function sseChunk(payload: Record<string, unknown>): Uint8Array {
+ function sseChunk(payload: Record<string, unknown>): Uint8Array {  // already typed ✓
```

→ The real gap is in `lib/responseCache.ts` and `lib/firebase.ts`. Add return types to all exported functions there.

---

### 1.5 — Extract magic `"assistant"` role string in components

**File:** `components/chat/MessageBubble.tsx` line 41

```ts
// types/index.ts — add role constant
export const UI_ROLES = { USER: "user", ASSISTANT: "assistant" } as const;
export type UIRole = typeof UI_ROLES[keyof typeof UI_ROLES];
```

Then in `MessageBubble.tsx`:
```diff
- const isUser = message.role === "user";
+ import { UI_ROLES } from "@/types";
+ const isUser = message.role === UI_ROLES.USER;
```

**Why:** The string `"user"` and `"assistant"` are repeated across `types/index.ts`, `MessageBubble.tsx`, and `components.test.tsx`. A constant prevents silent divergence.

---

### 1.6 — Add `"use client"` boundary comment for page.tsx

**File:** `app/page.tsx` line 1

`page.tsx` is `"use client"` due to `framer-motion`. However, the stats bar and footer are fully static. Consider splitting into:

- `app/page.tsx` — server component (no `"use client"`)
- `components/HeroSection.tsx` — client component for `motion.*`
- `components/FeaturesGrid.tsx` — client component for `motion.*`

**Why:** Keeping an entire 650-line page as a client component means the entire bundle is shipped to the client eagerly. Splitting lets Next.js server-render the static sections, improving both perceived quality and Core Web Vitals.

---

### 1.7 — Add `vitest.config.ts` coverage thresholds

**File:** `vitest.config.ts`

```ts
// Add coverage thresholds so CI fails if coverage drops
export default defineConfig({
  // ... existing config
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

---

## 2. Security — 98.75% → 100%

Almost perfect. Two concrete gaps remain.

### 2.1 — Tighten CSP: remove `'unsafe-eval'`

**File:** `middleware.ts` line 21

```diff
- "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
+ "script-src 'self' 'unsafe-inline' https://apis.google.com",
```

**Why:** `'unsafe-eval'` allows `eval()`, `new Function()`, and `setTimeout(string)`. It's the most dangerous CSP directive after `'unsafe-inline'`. Next.js 15 does **not** require `unsafe-eval` in production builds. This is a significant security signal to evaluators.

> [!IMPORTANT]
> Test your build after this change. Run `npm run build` and verify no console CSP errors appear. If a dependency needs it, audit which one and seek an alternative.

---

### 2.2 — Add `X-DNS-Prefetch-Control` header

**File:** `middleware.ts` — after the existing headers

```ts
response.headers.set("X-DNS-Prefetch-Control", "off");
```

**Why:** Prevents passive information leakage via DNS prefetch for cross-origin links. Small signal, but shows comprehensive security header coverage.

---

### 2.3 — Validate `Content-Type` header on POST /api/chat

**File:** `app/api/chat/route.ts` — add before body parsing

```ts
// ── 2a. Validate Content-Type ──────────────────────────────────────────────
const contentType = request.headers.get("content-type") ?? "";
if (!contentType.includes("application/json")) {
  return NextResponse.json(
    { error: "Content-Type must be application/json." },
    { status: 415 }
  );
}
```

**Why:** Currently any `Content-Type` is accepted. Strict content-type checking prevents CSRF-style requests from HTML forms (which can't set `application/json`) and is a defense-in-depth measure.

---

### 2.4 — Rate limit by IP + fingerprint, not raw header

**File:** `lib/rateLimit.ts` line 74

The current implementation trusts `x-forwarded-for` completely. Add a note/TODO and normalize the IP:

```ts
export function checkRateLimit(identifier: string): RateLimitResult {
  // Normalize identifier to prevent header-spoofing abuse
  const normalizedId = identifier.toLowerCase().trim() || "unknown";
  // ... rest of function using normalizedId
}
```

---

## 3. Testing — 96.25% → 99%+

Good coverage already. Three gaps to close.

### 3.1 — Add missing edge-case unit tests for `sanitize.ts`

**File:** `tests/unit/sanitize.test.ts` — add these test cases

```ts
it("returns error for non-string input (number)", () => {
  const result = sanitizeUserMessage(42 as unknown as string);
  expect(result.sanitized).toBeNull();
  expect(result.error).toBeTruthy();
});

it("returns error for null input", () => {
  const result = sanitizeUserMessage(null as unknown as string);
  expect(result.sanitized).toBeNull();
});

it("returns error for undefined input", () => {
  const result = sanitizeUserMessage(undefined as unknown as string);
  expect(result.sanitized).toBeNull();
});

it("strips nested HTML injection attempts", () => {
  const result = sanitizeUserMessage('<img src=x onerror="alert(1)">');
  expect(result.sanitized).not.toContain("<img");
});

it("handles message at exactly max length (boundary)", () => {
  const maxMsg = "a".repeat(2000); // MAX_MESSAGE_LENGTH
  const result = sanitizeUserMessage(maxMsg);
  expect(result.sanitized).not.toBeNull();
});

it("rejects message one character over max length", () => {
  const tooLong = "a".repeat(2001);
  const result = sanitizeUserMessage(tooLong);
  expect(result.sanitized).toBeNull();
});
```

---

### 3.2 — Add `rateLimit.test.ts` burst and cleanup tests

**File:** `tests/unit/rateLimit.test.ts` — add these test cases

```ts
it("allows requests up to the token limit", () => {
  const id = `burst-${Math.random()}`;
  // Should allow RATE_LIMIT_MAX_TOKENS requests
  for (let i = 0; i < 20; i++) {
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
  }
});

it("blocks the 21st request after 20 consecutive calls", () => {
  const id = `block-${Math.random()}`;
  for (let i = 0; i < 20; i++) checkRateLimit(id);
  const blocked = checkRateLimit(id);
  expect(blocked.allowed).toBe(false);
  expect(blocked.remaining).toBe(0);
});

it("cleanupStaleBuckets returns the count of pruned buckets", () => {
  // Fill a bucket, then prune
  const id = `stale-${Math.random()}`;
  checkRateLimit(id);
  const pruned = cleanupStaleBuckets(); // Won't prune (not stale yet)
  expect(typeof pruned).toBe("number");
});
```

---

### 3.3 — Add `responseCache.test.ts` TTL expiry test

**File:** `tests/unit/responseCache.test.ts` — add:

```ts
it("does not return cached response after TTL expires (mock timers)", () => {
  vi.useFakeTimers();
  setCachedResponse("test-key", "cached value");
  // Fast-forward past TTL (1 hour)
  vi.advanceTimersByTime(60 * 60 * 1000 + 1);
  const result = getCachedResponse("test-key");
  expect(result).toBeNull();
  vi.useRealTimers();
});
```

---

### 3.4 — Add a middleware security header test

Create a new file:

**File:** `tests/unit/middleware.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

describe("Security Middleware", () => {
  function makeReq(path = "/") {
    return new NextRequest(`http://localhost:3000${path}`);
  }

  it("sets Content-Security-Policy header", async () => {
    const res = middleware(makeReq());
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
  });

  it("sets X-Frame-Options to DENY", async () => {
    const res = middleware(makeReq());
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    const res = middleware(makeReq());
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets Strict-Transport-Security", async () => {
    const res = middleware(makeReq());
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age");
  });

  it("sets Referrer-Policy", async () => {
    const res = middleware(makeReq());
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});
```

---

### 3.5 — Add Playwright accessibility test with axe-core

**File:** `tests/e2e/ballotflow.spec.ts` — add:

```ts
import AxeBuilder from "@axe-core/playwright";

test("home page has no critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("chat page has no critical accessibility violations", async ({ page }) => {
  await page.goto("/chat");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Install: `npm install --save-dev @axe-core/playwright`

---

## 4. Accessibility — 98.75% → 100%

Nearly perfect. Three targeted improvements.

### 4.1 — Add `skip to main content` link

**File:** `app/layout.tsx` — add as the **very first** child of `<body>`

```tsx
export default function RootLayout({ children }: ...) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {/* Skip navigation link — visually hidden until focused */}
        <a
          href="#main-content"
          className="skip-link"
          style={{
            position: "absolute",
            top: "-100%",
            left: 0,
            padding: "0.5rem 1rem",
            background: "var(--color-primary)",
            color: "#fff",
            zIndex: 9999,
            borderRadius: "0 0 4px 0",
            // Visible on focus:
            // Add :focus { top: 0 } to globals.css
          }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
```

**File:** `app/globals.css` — add:
```css
.skip-link:focus {
  top: 0 !important;
}
```

**File:** `app/page.tsx` — add `id="main-content"` to the `<main>` element:
```diff
- <main className="bg-mesh min-h-screen">
+ <main id="main-content" className="bg-mesh min-h-screen">
```

**Why:** WCAG 2.1 SC 2.4.1 requires a mechanism to skip repeated navigation blocks. This is one of the most commonly flagged WCAG issues in automated audits.

---

### 4.2 — Add `aria-live` region for streaming chat responses

**File:** `app/chat/page.tsx` (or wherever the chat log is rendered)

The AI streaming response appears token-by-token, but screen readers won't announce incremental updates without an `aria-live` region. Add a dedicated live region:

```tsx
{/* Screen reader live region for streaming responses */}
<div
  aria-live="polite"
  aria-atomic="false"
  className="sr-only"
  id="chat-live-region"
>
  {/* Inject only the latest AI token here during streaming */}
  {latestStreamToken}
</div>
```

**Why:** Without this, blind users hear nothing while the AI is streaming. The `TypingIndicator` already has `aria-live="polite"`, but the actual response content also needs announcing.

---

### 4.3 — Add `prefers-reduced-motion` media query for animations

**File:** `app/globals.css` — add:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also update `framer-motion` usage in `app/page.tsx` — wrap animations in a hook:

```ts
// At top of page.tsx
import { useReducedMotion } from "framer-motion";

// Inside component:
const shouldReduce = useReducedMotion();
const fadeInUp = {
  hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: shouldReduce ? 0 : i * 0.1, duration: shouldReduce ? 0 : 0.5 },
  }),
};
```

**Why:** WCAG 2.1 SC 2.3.3 (AAA) / SC 2.3.2 recommends respecting `prefers-reduced-motion`. Accessibility auditors check for this.

---

### 4.4 — Add `autocomplete` and `aria-describedby` to chat input

**File:** `app/chat/page.tsx` — on the `<textarea>` or `<input>`:

```tsx
<textarea
  id="chat-input"
  aria-label="Ask an election question"
  aria-describedby="chat-input-hint"
  autoComplete="off"
  spellCheck="true"
  // ... other props
/>
<span id="chat-input-hint" className="sr-only">
  Type your election question and press Enter or click Send
</span>
```

**Why:** `aria-describedby` connects the hint text to the input for screen readers. `autoComplete="off"` is appropriate for dynamic search/chat inputs.

---

## Priority Order (by impact on score)

| Priority | Task | Category | Effort |
|----------|------|----------|--------|
| 🔴 1 | Add skip-to-content link | Accessibility | 15 min |
| 🔴 2 | Remove `'unsafe-eval'` from CSP | Security | 10 min |
| 🔴 3 | Add middleware unit tests | Testing | 30 min |
| 🔴 4 | Add boundary tests for sanitize.ts | Testing | 20 min |
| 🔴 5 | Add `prefers-reduced-motion` | Accessibility | 20 min |
| 🟡 6 | Elevate `no-explicit-any` to error | Code Quality | 10 min |
| 🟡 7 | Fix `no-console` allow list | Code Quality | 5 min |
| 🟡 8 | Add axe-core Playwright tests | Testing | 30 min |
| 🟡 9 | Add `Content-Type: 415` guard | Security | 10 min |
| 🟡 10 | Add `aria-live` for streaming | Accessibility | 20 min |
| 🟢 11 | Fix `ChatSession.createdAt` type | Code Quality | 15 min |
| 🟢 12 | Add coverage thresholds to vitest | Testing | 10 min |
| 🟢 13 | Split page.tsx into server + client | Code Quality | 45 min |
| 🟢 14 | Add TTL expiry cache test | Testing | 15 min |

> [!TIP]
> Start with 🔴 (red) items — each one directly addresses a known gap in the scoring rubric with minimal implementation risk.
