import Groq from "groq-sdk";
import { env } from "@/lib/env";
import { AIProvider, AIProviderOptions } from "./ai-provider.interface";

export class GroqProvider implements AIProvider {
  private client: Groq;
  private readonly model = "llama-3.3-70b-versatile";
//initialize instance
  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not defined");
    }
    //constructor checks for api 

    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }

  async generate(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.model,
        temperature: options?.temperature ?? 0.7,
        response_format: options?.responseSchema
          ? { type: "json_object" }
          : undefined,
      });

      const text = response.choices[0]?.message?.content?.trim();

      if (!text) {
        throw new Error("AI returned an empty response");
      }

      return text;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      console.error("[GROQ_PROVIDER_ERROR]: Generation failed", {
        message: err.message,
        stack: err.stack,
      });

      throw err;
    }
  }
}

export const groqProvider = new GroqProvider();
