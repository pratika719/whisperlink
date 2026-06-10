import { Suspense } from "react";
import { Metadata } from "next";

import { AuthLayout } from "@/components/ui/layout/AuthLayout";
import { Spinner } from "@/components/spinner";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log In",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to manage your anonymous inbox."
    >
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
