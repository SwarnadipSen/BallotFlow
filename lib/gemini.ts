/**
 * Gemini AI client configuration and helper functions.
 * Uses @google/generative-ai SDK with streaming support.
 */

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentStreamResult,
} from "@google/generative-ai";
import fs from "fs";
import path from "path";

// ─── Client Initialization ────────────────────────────────────────────────────

const getGeminiClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add it to your environment variables."
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

// ─── System Prompt ────────────────────────────────────────────────────────────

let cachedSystemPrompt: string | null = null;

const getSystemPrompt = (): string => {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  try {
    const promptPath = path.join(process.cwd(), "prompts", "system.txt");
    cachedSystemPrompt = fs.readFileSync(promptPath, "utf-8");
    return cachedSystemPrompt;
  } catch {
    // Fallback system prompt if file is not found
    return `You are BallotFlow's Ballot Guide — a friendly, non-partisan civic education assistant.
Help citizens understand election processes, timelines, voter registration, and civic participation.
Be clear, structured, and always direct users to official sources when uncertain.`;
  }
};

// ─── Safety Settings ──────────────────────────────────────────────────────────

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
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

// ─── Streaming Chat ───────────────────────────────────────────────────────────

/**
 * Creates a streaming chat session with Gemini and returns the stream result.
 * Uses gemini-2.0-flash for fast, cost-efficient responses.
 */
export async function streamChatResponse(
  history: ChatMessage[],
  userMessage: string
): Promise<GenerateContentStreamResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: getSystemPrompt(),
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const chat = model.startChat({
    history,
  });

  return chat.sendMessageStream(userMessage);
}

/**
 * Non-streaming single response — used for health checks and testing.
 */
export async function getSingleResponse(prompt: string): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: getSystemPrompt(),
    safetySettings: SAFETY_SETTINGS,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
