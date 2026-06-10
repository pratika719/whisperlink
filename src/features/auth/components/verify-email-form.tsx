"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { VerifyOtpSchema } from "@/schemas/auth.schema";
import { useVerifyEmail } from "@/features/auth/hooks/use-verify-email";
import { useResendVerification } from "@/features/auth/hooks/use-resend-verification";
import type { VerifyOtpInput } from "@/features/auth/types/auth.types";
import { FormMessage } from "./form-message";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      email,
      otp: "",
    },
  });

  function handleResend() {
    const targetEmail = getValues("email");
    if (!targetEmail) return;
    resendMutation.mutate(targetEmail);
  }

  return (
    <form onSubmit={handleSubmit((data) => verifyMutation.mutate(data))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="h-11"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FormMessage message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">Verification code</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="h-12 text-center font-mono text-lg tracking-[0.25em]"
          maxLength={6}
          placeholder="000000"
          aria-invalid={!!errors.otp}
          {...register("otp")}
        />
        <FormMessage message={errors.otp?.message} />
      </div>

      <Button type="submit" className="h-11 w-full" disabled={verifyMutation.isPending}>
        {verifyMutation.isPending ? <Spinner size="sm" /> : <MailCheck />}
        Verify email
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={handleResend}
        disabled={resendMutation.isPending}
      >
        {resendMutation.isPending ? <Spinner size="sm" /> : <RefreshCw />}
        Resend code
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
