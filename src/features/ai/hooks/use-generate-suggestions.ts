"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiClient } from "@/features/ai/api/ai.client";

export function useGenerateSuggestions() {
  return useMutation({
    mutationFn: async (username: string) => {
      const res = await aiClient.generateSuggestions(username);
      return res.data.data.suggestions;
    },
    onError: (error: unknown) => {
      let message = "Failed to generate message suggestions";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "object" && error !== null) {
        const errObj = error as Record<string, unknown>;
        const response = errObj.response as Record<string, unknown> | undefined;
        const data = response?.data as Record<string, unknown> | undefined;
        if (typeof data?.message === "string") {
          message = data.message;
        } else if (typeof errObj.message === "string") {
          message = errObj.message;
        }
      }
      toast.error(message);
    },
  });
}
