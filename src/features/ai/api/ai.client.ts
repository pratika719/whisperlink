import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface AIResponseSuggestions {
  suggestions: string[];
}

export const aiClient = {
  generateSuggestions(username: string) {
    return api.post<ApiResponse<AIResponseSuggestions>>("/ai/suggestions", {
      username,
    });
  },
};
