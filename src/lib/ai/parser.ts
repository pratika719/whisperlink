import { z } from "zod";
import { ApiError } from "@/lib/api-error";

export function parseAIResponse<T>(raw: string, schema: z.ZodType<T>): T {
  try {
    let cleaned = raw.trim();
    
    // Remove markdown code block formatting if present
    if (cleaned.startsWith("```")) {
      // Handles both ```json ... ``` and generic ``` ... ```
      cleaned = cleaned
        .replace(/^```(?:json)?\n?/i, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    const json = JSON.parse(cleaned);
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      console.error("AI response validation failed:", parsed.error.format());
      throw new ApiError(500, "AI response validation failed");
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Failed to parse AI response:", error, "Raw response:", raw);
    throw new ApiError(500, "Failed to parse or validate AI response");
  }
}
