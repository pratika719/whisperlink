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
import { NextResponse } from "next/server";

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

  try {
    // DEEP HEALTH CHECK: Actually query the database
    //
    // prisma.$queryRaw`SELECT 1` sends the simplest possible SQL query.
    // Every database supports "SELECT 1" — it just returns the number 1.
    // If this succeeds: the connection works.
    // If this throws: the database is unreachable, misconfigured, or down.
    //
    // WHY NOT a real table query like prisma.user.count()?
    // - $queryRaw`SELECT 1` works even if no tables exist yet
    // - It's faster (no table scan)
    // - It tests connectivity without table access permissions
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),

        // Database connection confirmed working
        database: {
          status: "connected",
          responseTimeMs: responseTime,
        },

        // App environment info
        environment: process.env.NODE_ENV ?? "unknown",
      },
      { status: 200 }
    );
  } catch (error) {
    // Database is unreachable — return 503 (Service Unavailable)
    // 503 is the correct status for "I'm up but my dependency is down"
    // vs 500 which means "I crashed unexpectedly"

    console.error("[Health Check] Database connection failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          status: "disconnected",
          error: error instanceof Error ? error.message : "Unknown database error",
        },
      },
      { status: 503 }
    );
  }
}
