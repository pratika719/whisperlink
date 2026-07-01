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
import { redis } from "@/lib/redis/redis";
import { emailQueue } from "@/lib/queues/email.queue";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  let redisStatus = "connected";
  let redisResponseTimeMs = 0;
  let redisError: string | null = null;

  try {
    const redisStart = Date.now();
    const pingRes = await redis.ping();
    if (pingRes !== "PONG") {
      throw new Error(`Unexpected ping response: ${pingRes}`);
    }
    redisResponseTimeMs = Date.now() - redisStart;
  } catch (error) {
    redisStatus = "disconnected";
    redisError = error instanceof Error ? error.message : "Unknown redis error";
    console.error("[Health Check] Redis connection failed:", error);
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

  const isHealthy =
    databaseStatus === "connected" &&
    redisStatus === "connected" &&
    queueStatus === "connected";
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
      redis: {
        status: redisStatus,
        responseTimeMs: redisResponseTimeMs,
        ...(redisError && { error: redisError }),
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
