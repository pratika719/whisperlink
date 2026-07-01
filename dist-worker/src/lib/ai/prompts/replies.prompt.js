"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRepliesPrompt = buildRepliesPrompt;
function buildRepliesPrompt(content) {
    return `You are an AI assistant for WhisperLink, an anonymous feedback messaging app.
Generate exactly three distinct reply suggestions for the following anonymous feedback message.

Feedback message: "${content}"

Your goal is to provide three different ways the receiver could respond to this message:
1. "casual": A casual, friendly, everyday response (e.g., 'Thanks for the feedback!', 'Haha, thanks!').
2. "witty": A witty, clever, funny, or slightly playful response.
3. "thoughtful": A thoughtful, deep, polite, or empathetic response.

Rules:
- Each suggestion must be a single-sentence message.
- Keep them short and natural.
- You must return your response as a JSON object matching this schema:
{
  "casual": "your casual response",
  "witty": "your witty response",
  "thoughtful": "your thoughtful response"
}

Ensure the output is valid JSON and strictly contains only the requested object.`;
}
