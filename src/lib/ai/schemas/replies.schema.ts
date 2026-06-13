import { z } from "zod";

export const repliesResponseSchema = z.object({
  casual: z.string().min(1),
  witty: z.string().min(1),
  thoughtful: z.string().min(1),
});

export type RepliesResponse = z.infer<typeof repliesResponseSchema>;
