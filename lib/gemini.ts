/**
 * Gemini AI client — singleton pattern for efficiency.
 *
 * Design decisions:
 * - `genAI` and `model` are module-level singletons: initialized once per
 *   Cloud Run instance, reused across all requests. This avoids the cost of
 *   re-instantiating the SDK client on every API call.
 * - System prompt is read from disk once and cached in memory.
 * - Safety settings and generation config are defined as constants to prevent
 *   accidental mutation.
 */

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerativeModel,
  type GenerateContentStreamResult,
} from "@google/generative-ai";
import fs from "fs";
import path from "path";
import {
  GEMINI_MODEL,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_TEMPERATURE,
  GEMINI_TOP_P,
} from "@/lib/constants";
import type { GeminiMessage } from "@/types";

// ─── Safety Settings (module-level constant) ──────────────────────────────────

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
] as const;

// ─── System Prompt (read once, cached forever per instance) ───────────────────

let _systemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (_systemPrompt !== null) return _systemPrompt;

  try {
    const promptPath = path.join(process.cwd(), "prompts", "system.txt");
    _systemPrompt = fs.readFileSync(promptPath, "utf-8").trim();
  } catch {
    // Fallback — always produces a working assistant even without the file
    _systemPrompt = [
      "You are BallotFlow's Ballot Guide — a friendly, non-partisan civic education assistant.",
      "Help citizens understand election processes, timelines, voter registration, and civic participation.",
      "Be clear, structured, and always direct users to official sources when uncertain.",
    ].join(" ");
  }

  return _systemPrompt;
}

// ─── Singleton Client & Model ─────────────────────────────────────────────────

/** Module-level Gemini client — initialized once per Cloud Run instance */
let _genAI: GoogleGenerativeAI | null = null;

/** Module-level generative model — initialized once per Cloud Run instance */
let _model: GenerativeModel | null = null;

/**
 * Returns the singleton Gemini model, initializing it if needed.
 * Throws a descriptive error if GEMINI_API_KEY is absent.
 */
function getModel(): GenerativeModel {
  if (_model !== null) return _model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Add it to .env.local for development or Secret Manager for production."
    );
  }

  _genAI = new GoogleGenerativeAI(apiKey);
  _model = _genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: getSystemPrompt(),
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
      temperature: GEMINI_TEMPERATURE,
      topP: GEMINI_TOP_P,
    },
  });

  return _model;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Starts a streaming chat session with Gemini.
 *
 * @param history - Prior conversation turns (user + model alternating)
 * @param userMessage - The sanitized user message for this turn
 * @returns A streaming result whose `.stream` async iterable yields text chunks
 */
export async function streamChatResponse(
  history: GeminiMessage[],
  userMessage: string
): Promise<GenerateContentStreamResult> {
  const model = getModel();
  const chat = model.startChat({ history });
  return chat.sendMessageStream(userMessage);
}

/**
 * Generates a single (non-streaming) response.
 * Used for health checks, testing, and cached response warm-up.
 */
export async function getSingleResponse(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Re-export the type so consumers don't need to import from two places
export type { GeminiMessage };
