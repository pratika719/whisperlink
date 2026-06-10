"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { ForgotPasswordSchema } from "@/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import type { ForgotPasswordInput } from "@/features/auth/types/auth.types";
import { FormMessage } from "./form-message";

export function ForgotPasswordForm() {
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => forgotMutation.mutate(data))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 pl-9"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        <FormMessage message={errors.email?.message} />
      </div>

      {forgotMutation.isSuccess ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Check your inbox and spam folder for a password reset link.
        </div>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={forgotMutation.isPending}>
        {forgotMutation.isPending ? <Spinner size="sm" /> : <Send />}
        Send reset link
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
