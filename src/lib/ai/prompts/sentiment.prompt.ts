export function buildSentimentPrompt(content: string): string {
  return `Analyze the sentiment of the following message content. 

Message content:
"${content}"

Provide the sentiment categorization and a confidence/strength score.
The sentiment must be exactly one of: "POSITIVE", "NEGATIVE", or "NEUTRAL".
The score must be a floating-point number between 0 and 1 (inclusive), indicating the intensity or confidence of the sentiment (where 0 is very weak/uncertain and 1 is extremely strong/certain).

You must return your response as a JSON object matching this schema:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "score": 0.85
}

Ensure the output is valid JSON and strictly contains only the requested object.`;
}
