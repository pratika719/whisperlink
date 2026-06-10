"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import type { ForgotPasswordInput } from "@/features/auth/types/auth.types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authClient.forgotPassword(data),
    onSuccess: () => {
      toast.success("If that email exists, a reset link has been sent.");
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}
