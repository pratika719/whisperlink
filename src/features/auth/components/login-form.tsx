"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { LoginSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import type { LoginInput } from "@/features/auth/types/auth.types";
import { FormMessage } from "./form-message";

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11 pl-9"
            placeholder="Your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </div>
        <FormMessage message={errors.password?.message} />
      </div>

      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : <LogIn />}
        Log in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to WhisperLink?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
