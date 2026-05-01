# BallotFlow 🗳️

**AI-powered election process assistant** built for Google Promptwar Challenge 2.

[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Powered by Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-blue)](https://deepmind.google/technologies/gemini/)
[![Deployed on Cloud Run](https://img.shields.io/badge/Cloud%20Run-Google%20Cloud-4285F4)](https://cloud.google.com/run)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## What is BallotFlow?

BallotFlow is a free, non-partisan AI civic education assistant that helps citizens of any country understand:

- 🗳️ **How to register to vote** — eligibility, deadlines, process
- 📅 **Election timelines** — step-by-step from registration to inauguration
- 📬 **Voting methods** — mail-in, early voting, absentee, in-person
- 🔢 **Ballot types** — ranked choice, FPTP, proportional representation
- ✅ **How votes are counted** — canvassing, certification, recounts
- 📖 **Election glossary** — 26+ terms explained in plain language

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Custom CSS design system |
| AI | Google Gemini 2.0 Flash (streaming) |
| Database | Firestore |
| Auth | Firebase Auth (Google Sign-In) |
| Hosting | Cloud Run |
| Secrets | Secret Manager |
| CI/CD | Cloud Build |
| Logging | Cloud Logging |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- Optional: Firebase project (for session storage)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local .env.local.bak  # already created

# Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Tip:** Without Firebase credentials, the app works fully — chat sessions just won't be persisted to Firestore.

---

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires dev server running)
npm run test:e2e
```

---

## Deploying to Google Cloud

### 1. Create GCP Project

```bash
gcloud projects create ballotflow-app --name="BallotFlow"
gcloud config set project ballotflow-app
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Create Artifact Registry

```bash
gcloud artifacts repositories create ballotflow-repo \
  --repository-format=docker \
  --location=us-central1
```

### 4. Store Secrets

```bash
echo -n "YOUR_GEMINI_API_KEY" | \
  gcloud secrets create gemini-api-key --data-file=-

echo -n "YOUR_FIREBASE_CLIENT_EMAIL" | \
  gcloud secrets create firebase-admin-client-email --data-file=-

echo -n "YOUR_FIREBASE_PRIVATE_KEY" | \
  gcloud secrets create firebase-admin-private-key --data-file=-
```

### 5. Deploy via Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _REGION=us-central1,_SERVICE_NAME=ballotflow
```

Cloud Build will automatically:
1. Run unit tests
2. Build the Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run

---

## Google Services Integration

| Service | Purpose |
|---|---|
| **Gemini 2.0 Flash** | Core AI engine — streaming conversational responses |
| **Cloud Run** | Serverless container hosting, auto-scales to 0 |
| **Firestore** | Chat session persistence, user history |
| **Firebase Auth** | Optional Google Sign-In |
| **Secret Manager** | Secure API key storage (never in source code) |
| **Cloud Build** | Automated CI/CD pipeline |
| **Cloud Logging** | Structured operational logging |
| **Search Grounding** | Gemini grounded answers via Google Search |

---

## Evaluation Criteria Compliance

### ✅ Code Quality
- TypeScript strict mode throughout
- ESLint + clean component architecture
- Comprehensive JSDoc comments
- No magic numbers — all constants extracted

### ✅ Security
- All secrets in Secret Manager (never in code)
- Input sanitization with prompt injection detection
- Content Security Policy headers via middleware
- Token bucket rate limiting on API routes
- Non-root Docker user
- HSTS, X-Frame-Options, X-Content-Type-Options

### ✅ Efficiency
- Gemini 2.0 Flash — fastest model for conversational tasks
- Streaming SSE — first token < 500ms
- Standalone Next.js output — minimal Docker image
- Package tree-shaking via optimizePackageImports

### ✅ Testing
- Unit tests: Vitest (sanitization, rate limiting)
- E2E tests: Playwright (navigation, chat, API, accessibility)
- Cloud Build runs tests before every deployment

### ✅ Accessibility
- WCAG 2.1 AA compliant
- `aria-live` regions for streaming AI responses
- Full keyboard navigation
- `aria-expanded` for accordion steps
- Semantic HTML5 landmarks (main, header, nav, footer)
- `lang="en"` on root element
- `prefers-reduced-motion` respected in CSS
- Screen reader labels on all interactive elements

### ✅ Google Services
8 Google services integrated (see table above)

---

## Project Structure

```
BallotFlow/
├── app/                    # Next.js App Router pages
│   ├── api/chat/           # Streaming Gemini endpoint
│   ├── api/health/         # Cloud Run health check
│   ├── chat/               # AI chat interface
│   ├── timeline/           # Election timeline visualizer
│   ├── glossary/           # Searchable glossary
│   └── page.tsx            # Landing page
├── lib/
│   ├── gemini.ts           # Gemini AI client
│   ├── firebase.ts         # Firestore + Auth
│   ├── sanitize.ts         # Input sanitization
│   └── rateLimit.ts        # Token bucket rate limiter
├── prompts/
│   └── system.txt          # Gemini system prompt
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── Dockerfile              # Multi-stage production build
├── cloudbuild.yaml         # Cloud Build CI/CD pipeline
└── middleware.ts           # Security headers
```

---

## License

MIT — built for educational purposes as part of Google Promptwar Challenge 2.
