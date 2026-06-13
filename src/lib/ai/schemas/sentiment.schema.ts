import { z } from "zod";

export const sentimentResponseSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  score: z.number().min(0).max(1),
});

export type SentimentResponse = z.infer<typeof sentimentResponseSchema>;
