import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { aiUsageRepository } from "@/repositories/ai-usage.repository";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { unauthorized } from "@/lib/errors";

/**
 * Protected route to get the current user's AI usage and remaining quotas.
 */
export async function GET() {
  try {
    const token = await getSessionCookie();
    if (!token) throw unauthorized();

    const session = await verifyAccessToken(token);
    const userId = session.sub;

    const suggestions = await aiUsageRepository.canUseSuggestions(userId);
    const analysis = await aiUsageRepository.canUseAnalysis(userId);

    return successResponse({
      suggestions: {
        allowed: suggestions.allowed,
        remaining: suggestions.remaining,
        used: suggestions.usage?.suggestionsUsed ?? 0,
      },
      analysis: {
        allowed: analysis.allowed,
        remaining: analysis.remaining,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
