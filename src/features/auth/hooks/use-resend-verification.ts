"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authClient.resendVerification(email),
    onSuccess: () => {
      toast.success("A new verification code has been sent.");
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}
