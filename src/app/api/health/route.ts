// =============================================================================
// src/app/api/health/route.ts — DATABASE HEALTH CHECK ENDPOINT
// =============================================================================
//
// WHAT IS A HEALTH CHECK ENDPOINT?
// Every production service needs a /health or /api/health endpoint.
// It answers one question: "Is the service up and working correctly?"
//
// WHO USES IT?
// - Deployment platforms (Vercel, Railway, Render) check this to know
//   if a deployment succeeded
// - Load balancers check this to know if they should route traffic to an instance
// - Monitoring tools (Datadog, Sentry) alert you if health starts failing
// - YOU, manually, when you want to verify the DB connection works
//
// WHAT DOES A GOOD HEALTH CHECK DO?
// A shallow health check just returns 200 OK.
// A DEEP health check actually queries the database:
//   - Confirms the application can reach the database
//   - Confirms the database responded within acceptable time
//   - Reveals connection issues that wouldn't otherwise surface until real requests
//
// We implement a DEEP health check here.

import { prisma } from "@/lib/prisma/prisma";
import { emailQueue } from "@/lib/queues/email.queue";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// =============================================================================
// HOW NEXT.JS 15+ API ROUTES WORK
// =============================================================================
//
// In Next.js App Router, API routes are defined by exporting named functions
// matching HTTP method names: GET, POST, PUT, PATCH, DELETE
//
// Each function receives a `Request` object (Web API standard — not Node.js http)
// and returns a `Response` object (also Web API standard).
//
// NextResponse.json() is a helper that creates a Response with:
//   - Content-Type: application/json header
//   - The data serialized as JSON
//   - The status code you specify (defaults to 200)
//
// ROUTE FILE LOCATION → URL MAPPING:
// src/app/api/health/route.ts → GET /api/health

export async function GET() {
  const startTime = Date.now();

  let databaseStatus = "connected";
  let databaseResponseTimeMs = 0;
  let databaseError: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    databaseResponseTimeMs = Date.now() - dbStart;
  } catch (error) {
    databaseStatus = "disconnected";
    databaseError = error instanceof Error ? error.message : "Unknown database error";
    console.error("[Health Check] Database connection failed:", error);
  }

  let queueStatus = "connected";
  let queueResponseTimeMs = 0;
  let jobCounts: Record<string, number> | null = null;
  let queueError: string | null = null;

  try {
    const queueStart = Date.now();
    jobCounts = await emailQueue.getJobCounts();
    queueResponseTimeMs = Date.now() - queueStart;
  } catch (error) {
    queueStatus = "disconnected";
    queueError = error instanceof Error ? error.message : "Unknown queue error";
    console.error("[Health Check] Queue connection failed:", error);
  }

  const isHealthy = databaseStatus === "connected" && queueStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      totalTimeMs: Date.now() - startTime,
      database: {
        status: databaseStatus,
        responseTimeMs: databaseResponseTimeMs,
        ...(databaseError && { error: databaseError }),
      },
      queue: {
        status: queueStatus,
        responseTimeMs: queueResponseTimeMs,
        jobCounts,
        ...(queueError && { error: queueError }),
      },
      environment: process.env.NODE_ENV ?? "unknown",
    },
    { status: statusCode }
  );
}
