"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useToggleMessages() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (acceptMessages: boolean) =>
      authClient.toggleAcceptMessages(acceptMessages),

    onMutate: async (acceptMessages) => {
      const previous = user;

      // Optimistic: update local store immediately
      if (user) {
        setUser({ ...user, acceptMessages });
      }

      return { previous };
    },

    onError: (_err, _val, context) => {
      // Rollback on error
      if (context?.previous) {
        setUser(context.previous);
      }
      toast.error("Failed to update setting. Please try again.");
    },

    onSuccess: (_res, acceptMessages) => {
      // Invalidate session so next fetch picks up the change
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success(
        acceptMessages
          ? "You're now accepting messages."
          : "Messages are now turned off."
      );
    },
  });
}
