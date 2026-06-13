import { NextRequest } from "next/server";
import { userRepository } from "@/repositories/user.repository";
import { aiUsageRepository } from "@/repositories/ai-usage.repository";
import { aiService } from "@/services/ai.service";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { badRequest, notFound } from "@/lib/errors";

/**
 * Public route to generate message suggestions for a user's profile.
 * No authentication required.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username } = body;

    if (!username) {
      return errorResponse(badRequest("Username is required"));
    }

    const user = await userRepository.findByUsername(username);
    if (!user) {
      return errorResponse(notFound("User not found"));
    }

    // Check daily quota
    const { allowed } = await aiUsageRepository.canUseSuggestions(user.id);
    if (!allowed) {
      // Return a 200 with fallback suggestions instead of a 429 to keep the public profile "working"
      // but without burning our AI quota.
      const fallbacks = [
        "What's one thing you're really excited about right now?",
        "I really appreciate how helpful you are to the team!",
        "What's your favorite book or movie of all time?",
        "You're doing an amazing job with your current project!",
        "What's a skill you've always wanted to learn?"
      ];
      return successResponse({ suggestions: fallbacks });
    }

    // Generate suggested messages
   const result =
  await aiService.generateMessageSuggestions(username);

if (result.source === "ai") {
  try {
    await aiUsageRepository.incrementSuggestions(user.id);
  } catch (logError) {
    console.error(
      "Failed to increment AI suggestions usage:",
      logError
    );
  }
}

return successResponse({
  suggestions: result.suggestions,
  source: result.source,
});
  } catch (error) {
    return errorResponse(error);
  }
}
