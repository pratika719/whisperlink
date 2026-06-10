"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import type { VerifyOtpInput } from "@/features/auth/types/auth.types";

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyOtpInput) => authClient.verifyEmail(data),
    onSuccess: () => {
      toast.success("Email verified. You can log in now.");
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error));
    },
  });
}
