// =============================================================================
// src/repositories/ai-usage.repository.ts
// =============================================================================
//
// This repository handles rate limiting for AI features.
//
// WHAT PROBLEM DOES THIS SOLVE?
// AI APIs (like Google Gemini) charge per request.
// Without limits, one user could:
// - Spam your AI endpoint in a loop
// - Cost you hundreds of dollars overnight
// - Deny service to other users (your quota gets exhausted)
//
// This repository implements the "token bucket" concept:
// Each user gets N AI calls per day. We track usage and reset daily.
//
// PRODUCTION RATE LIMITING APPROACH:
// For high-traffic apps, you'd use Redis for rate limiting (faster, atomic).
// For our stage of development, PostgreSQL is perfectly adequate.
// We can always migrate to Redis later if needed (repository pattern makes this easy!).
//
// THE LAZY INITIALIZATION PATTERN:
// We don't create an AIUsage record when a user registers.
// We create it on FIRST USE of an AI feature.
// WHY? Not all users will use AI features. Creating records proactively
// wastes storage and creates unnecessary database writes.
// This is called "lazy initialization" — defer work until it's actually needed.

import { prisma } from "../lib/prisma/prisma";

// Daily limits — change these in ONE place to affect the entire system
const DAILY_SUGGESTION_LIMIT = 50;
const DAILY_ANALYSIS_LIMIT = 10;

export const aiUsageRepository = {
  // ============================================================================
  // FIND OR CREATE: Upsert pattern
  // ============================================================================

  /**
   * Get a user's AI usage record, creating one if it doesn't exist yet.
   *
   * This is the UPSERT pattern (Update or Insert).
   * Prisma's upsert() does this atomically — one SQL statement.
   *
   * WITHOUT upsert (wrong way):
   *   const record = await findByUserId(userId)
   *   if (!record) await create(userId)  ← RACE CONDITION!
   *   // If two requests come in simultaneously, both might try to create
   *   // → database throws unique constraint violation
   *
   * WITH upsert:
   *   The database handles the "find or create" atomically.
   *   No race condition possible.
   *
   * Prisma upsert() → translates to:
   *   INSERT INTO "AIUsage" (userId, ...) VALUES (...)
   *   ON CONFLICT (userId) DO NOTHING  (or update if you want)
   */
  async findOrCreate(userId: string) {
    return prisma.aIUsage.upsert({
      where: { userId },
      // If it exists: return as-is (no update to data)
      update: {}, // empty update = "touch nothing, just return it"
      // If it doesn't exist: create a fresh record
      create: {
        userId,
        suggestionsUsed: 0,
        analysisUsed: 0,
      },
    });
  },

  // ============================================================================
  // READ: Get current usage
  // ============================================================================

  async findByUserId(userId: string) {
    return prisma.aIUsage.findUnique({
      where: { userId },
    });
  },

  // ============================================================================
  // CHECK: Can this user make another AI request?
  // ============================================================================

  /**
   * Check if a user can use AI suggestions (and whether to reset daily counter).
   *
   * THE DAILY RESET LOGIC:
   * We check if lastUsedAt was on a DIFFERENT calendar day.
   * If yes: reset their counter to 0 before checking limits.
   *
   * WHY NOT a cron job?
   * A cron job that resets all users at midnight is fragile:
   * - What if the cron fails? Users get blocked all day.
   * - Timezone issues: midnight is different for each user
   * - Scales poorly: one cron runs expensive UPDATE on the entire table
   *
   * "Reset on next request" is lazy evaluation:
   * - Only resets the user who actually makes a request
   * - Respects per-user timing (based on THEIR last usage day)
   * - No cron infrastructure needed
   * - Consistent and reliable
   */
  async canUseSuggestions(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    usage: Awaited<ReturnType<typeof prisma.aIUsage.findUnique>>;
  }> {
    const usage = await this.findOrCreate(userId);

    // Check if we should reset the daily counter
    const shouldReset = this.isDifferentDay(usage.lastUsedAt);

    if (shouldReset) {
      // Reset is needed — do it atomically and return fresh values
      const reset = await prisma.aIUsage.update({
        where: { userId },
        data: { suggestionsUsed: 0, analysisUsed: 0, lastUsedAt: new Date() },
      });
      return {
        allowed: true,
        remaining: DAILY_SUGGESTION_LIMIT,
        usage: reset,
      };
    }

    const remaining = DAILY_SUGGESTION_LIMIT - usage.suggestionsUsed;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      usage,
    };
  },

  async canUseAnalysis(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
  }> {
    const usage = await this.findOrCreate(userId);
    const shouldReset = this.isDifferentDay(usage.lastUsedAt);

    if (shouldReset) {
      await prisma.aIUsage.update({
        where: { userId },
        data: { suggestionsUsed: 0, analysisUsed: 0, lastUsedAt: new Date() },
      });
      return { allowed: true, remaining: DAILY_ANALYSIS_LIMIT };
    }

    const remaining = DAILY_ANALYSIS_LIMIT - usage.analysisUsed;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  },

  // ============================================================================
  // INCREMENT: Record an AI feature use
  // ============================================================================

  /**
   * Atomically increment the usage counter.
   *
   * WHY prisma.$executeRaw instead of update()?
   * This is the ATOMIC INCREMENT pattern:
   *   UPDATE "AIUsage" SET suggestionsUsed = suggestionsUsed + 1 WHERE userId = ?
   *
   * The alternative:
   *   const current = await findByUserId(userId)  // read
   *   await update({ suggestionsUsed: current.suggestionsUsed + 1 }) // write
   *
   * The read-then-write approach has a RACE CONDITION:
   * Two simultaneous requests both read 5, both write 6 → actual usage is 6, not 7.
   * The atomic SQL increment is immune to this race condition.
   *
   * Prisma's `increment` field operation does this atomically:
   */
  async incrementSuggestions(userId: string) {
    return prisma.aIUsage.update({
      where: { userId },
      data: {
        suggestionsUsed: { increment: 1 }, // Atomic: UPDATE SET col = col + 1
        lastUsedAt: new Date(),
      },
    });
  },

  async incrementAnalysis(userId: string) {
    return prisma.aIUsage.update({
      where: { userId },
      data: {
        analysisUsed: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  },

  // ============================================================================
  // UTILITY: Date comparison
  // ============================================================================

  /**
   * Check if a Date was on a different calendar day than today.
   * Used to determine if we should reset daily counters.
   */
  isDifferentDay(date: Date | null): boolean {
    if (!date) return true;
    const today = new Date();
    // Compare YYYY-MM-DD strings — timezone-safe for same-region comparison
    return (
      date.getFullYear() !== today.getFullYear() ||
      date.getMonth() !== today.getMonth() ||
      date.getDate() !== today.getDate()
    );
  },
};

// =============================================================================
// USAGE EXAMPLE IN AN AI SUGGESTION API ROUTE:
//
// const { allowed, remaining } = await aiUsageRepository.canUseSuggestions(userId)
//
// if (!allowed) {
//   return Response.json(
//     { error: `Daily limit reached. Resets tomorrow.` },
//     { status: 429 }  // 429 = Too Many Requests
//   )
// }
//
// const suggestions = await gemini.generateSuggestions(content)
// await aiUsageRepository.incrementSuggestions(userId)
//
// return Response.json({ suggestions, remaining: remaining - 1 })
// =============================================================================
