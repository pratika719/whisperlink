"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { RegisterSchema } from "@/schemas/auth.schema";
import { useRegister } from "@/features/auth/hooks/use-register";
import type { RegisterInput } from "@/features/auth/types/auth.types";
import { FormMessage } from "./form-message";

export function RegisterForm() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const isLoading = registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            autoComplete="username"
            className="h-11 pl-9"
            placeholder="yourname"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
        </div>
        <FormMessage message={errors.username?.message} />
      </div>

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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 pl-9"
            placeholder="Create a password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </div>
        <FormMessage message={errors.password?.message} />
      </div>

      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : <ArrowRight />}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
