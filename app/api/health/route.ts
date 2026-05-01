/**
 * GET /api/health
 *
 * Health check endpoint for Cloud Run liveness/readiness probes.
 * Returns 200 when the service is operational.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "ballotflow",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
    },
    { status: 200 }
  );
}
