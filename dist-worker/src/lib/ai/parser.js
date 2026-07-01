"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAIResponse = parseAIResponse;
const api_error_1 = require("../../lib/api-error");
function parseAIResponse(raw, schema) {
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
            throw new api_error_1.ApiError(500, "AI response validation failed");
        }
        return parsed.data;
    }
    catch (error) {
        if (error instanceof api_error_1.ApiError) {
            throw error;
        }
        console.error("Failed to parse AI response:", error, "Raw response:", raw);
        throw new api_error_1.ApiError(500, "Failed to parse or validate AI response");
    }
}
