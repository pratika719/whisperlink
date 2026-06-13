export interface AIProviderOptions {
  temperature?: number;
  responseSchema?: unknown; // To allow structured JSON mode if supported
}

export interface AIProvider {
  generate(prompt: string, options?: AIProviderOptions): Promise<string>;
}
