import { Sentiment } from "@/generated/prisma/client";
import { groqProvider } from "@/lib/ai/providers/groq.provider";
import { parseAIResponse } from "@/lib/ai/parser";
import { suggestionsResponseSchema } from "@/lib/ai/schemas/suggestions.schema";
import { sentimentResponseSchema } from "@/lib/ai/schemas/sentiment.schema";
import { repliesResponseSchema, RepliesResponse } from "@/lib/ai/schemas/replies.schema";
import { buildSuggestionsPrompt } from "@/lib/ai/prompts/suggestions.prompt";
import { buildSentimentPrompt } from "@/lib/ai/prompts/sentiment.prompt";
import { buildRepliesPrompt } from "@/lib/ai/prompts/replies.prompt";

/**
 * AI Service handles high-level business logic for AI features.
 * It depends on AIProvider abstraction and handles prompt generation,
 * validation, and safe parsing.
 */
export const aiService = {
  /**
   * Generates 5 anonymous message suggestions/ideas for a public profile.
   */
  async generateMessageSuggestions(
    username: string
  ): Promise<{
    suggestions: string[];
    source: "ai" | "fallback";
  }> {
    try {
      const prompt = buildSuggestionsPrompt(username);
//build prompt call prompt generator
      const rawResponse = await groqProvider.generate(prompt, {
        temperature: 0.7,
        responseSchema: suggestionsResponseSchema,
      });
//cal groq provider for ai response
//parse ai response

      const parsed = parseAIResponse(rawResponse, suggestionsResponseSchema);
//return ai generated suggestions
      return {
        suggestions: parsed.suggestions,
        source: "ai" as const,
      };
    } catch (error) {
      console.error(
        "[AI_SERVICE_ERROR]: generateMessageSuggestions failed",
        error
      );

      return {
        source: "fallback" as const,
        suggestions: [
          "What's one thing you're really excited about right now?",
          "I really appreciate how helpful you are to the team!",
          "What's your favorite book or movie of all time?",
          "You're doing an amazing job with your current project!",
          "What's a skill you've always wanted to learn?",
        ],
      };
    }
  },

  /**
   * Generates 3 reply suggestions for a specific message.
   */
  async generateReplySuggestions(content: string): Promise<RepliesResponse> {
    try {
      const prompt = buildRepliesPrompt(content);

      //prompt call prompt generator
      const rawResponse = await groqProvider.generate(prompt, {
        temperature: 0.7,
        responseSchema: repliesResponseSchema,
      });
      //cal groq provider for ai response
      //parse ai response

      return parseAIResponse(rawResponse, repliesResponseSchema);
    } catch (error) {
      console.error(
        "[AI_SERVICE_ERROR]: generateReplySuggestions failed",
        error
      );
      return {
        casual: "Thanks for the feedback!",
        witty: "I'll take that as a compliment! 😉",
        thoughtful: "Thank you for your honest feedback. I appreciate it.",
      };
    }
  },

  /**
   * Analyzes the sentiment of a message content.
   */
  async analyzeSentiment(
    content: string
  ): Promise<{ sentiment: Sentiment; score: number }> {
    try {
      const prompt = buildSentimentPrompt(content);
      const rawResponse = await groqProvider.generate(prompt, {
        temperature: 0.1,
        responseSchema: sentimentResponseSchema,
      });

      const parsed = parseAIResponse(rawResponse, sentimentResponseSchema);

      return {
        sentiment: parsed.sentiment as Sentiment,
        score: parsed.score,
      };
    } catch (error) {
      console.error("[AI_SERVICE_ERROR]: analyzeSentiment failed", error);
      return {
        sentiment: Sentiment.NEUTRAL,
        score: 0.5,
      };
    }
  },
};
