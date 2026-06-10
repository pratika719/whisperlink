"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/features/auth/api/auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error";
import type { LoginInput } from "@/features/auth/types/auth.types";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const hydrate = useAuthStore((s) => s.hydrate);

  return useMutation({
    mutationFn: (data: LoginInput) => authClient.login(data),
    onSuccess: (res) => {
      hydrate(res.data.data.user);
      toast.success("Welcome back.");
      router.replace(callbackUrl);
      router.refresh();
    },
    onError: (error, variables) => {
      const message = getAuthErrorMessage(error);
      
      if (message === "User not verified") {
        toast.info("Please verify your email to continue.");
        router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
      } else {
        toast.error(message);
      }
    },
  });
}
