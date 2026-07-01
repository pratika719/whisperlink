"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqProvider = exports.GroqProvider = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../../../lib/env");
class GroqProvider {
    client;
    model = "llama-3.3-70b-versatile";
    //initialize instance
    constructor() {
        if (!env_1.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY environment variable is not defined");
        }
        //constructor checks for api 
        this.client = new groq_sdk_1.default({
            apiKey: env_1.env.GROQ_API_KEY,
        });
    }
    async generate(prompt, options) {
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
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error("[GROQ_PROVIDER_ERROR]: Generation failed", {
                message: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.GroqProvider = GroqProvider;
exports.groqProvider = new GroqProvider();
