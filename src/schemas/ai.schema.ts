import { z } from "zod";
import { Sentiment } from "@/generated/prisma/client";

/**
 * Schema for sentiment analysis response.
 * We expect the AI to return one of the predefined sentiment values.
 */
export const AISentimentSchema = z.nativeEnum(Sentiment);

/**
 * Schema for suggested replies response.
 * We expect exactly three types of suggestions.
 */
export const AISuggestionsSchema = z.object({
  casual: z.string().min(1, "Casual suggestion is required"),
  witty: z.string().min(1, "Witty suggestion is required"),
  thoughtful: z.string().min(1, "Thoughtful suggestion is required"),
});

export type AISentimentResponse = z.infer<typeof AISentimentSchema>;
export type AISuggestionsResponse = z.infer<typeof AISuggestionsSchema>;
