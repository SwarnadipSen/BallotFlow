/**
 * Environment variable validation.
 *
 * Ensures all required environment variables are present on startup.
 * Throws a descriptive error if any are missing.
 * This prevents the app from running in a partially-configured state.
 */

import { logger } from "@/lib/logger";

const REQUIRED_SERVER_VARS = [
  "GEMINI_API_KEY",
] as const;

const REQUIRED_CLIENT_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

/**
 * Validates that all required environment variables are set.
 * Call this in server-side entry points (e.g. layout.tsx or API routes).
 */
export function validateEnv(): void {
  const missing: string[] = [];

  // Validate server-side variables
  if (typeof window === "undefined") {
    for (const key of REQUIRED_SERVER_VARS) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  // Validate client-side variables (publicly prefixed)
  for (const key of REQUIRED_CLIENT_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing environment variables: ${missing.join(", ")}`;
    logger.error(errorMsg);
    
    // In production, we want to fail hard early
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
  }
}
