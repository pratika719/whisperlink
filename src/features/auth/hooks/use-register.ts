"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import type { RegisterInput } from "@/features/auth/types/auth.types";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) => authClient.register(data),
    onSuccess: (_res, variables) => {
      toast.success("Verification code sent to your email.");
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}
