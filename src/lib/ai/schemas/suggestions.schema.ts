import { z } from "zod";

export const suggestionsResponseSchema = z.object({
  suggestions: z.array(z.string()).length(5),
});

export type SuggestionsResponse = z.infer<typeof suggestionsResponseSchema>;
