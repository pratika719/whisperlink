"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { ResetPasswordSchema } from "@/schemas/auth.schema";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import type { ResetPasswordInput } from "@/features/auth/types/auth.types";
import { FormMessage } from "./form-message";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => resetMutation.mutate(data))} className="space-y-5">
      <input type="hidden" {...register("token")} />

      {!token ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          This reset link is missing a token. Request a new password reset link.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 pl-9"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </div>
        <FormMessage message={errors.password?.message} />
        <FormMessage message={errors.token?.message} />
      </div>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={resetMutation.isPending || !token}
      >
        {resetMutation.isPending ? <Spinner size="sm" /> : <KeyRound />}
        Reset password
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Request one
        </Link>
      </p>
    </form>
  );
}
