import { Suspense } from "react";
import { Metadata } from "next";

import { AuthLayout } from "@/components/ui/layout/AuthLayout";
import { Spinner } from "@/components/spinner";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the six-digit code sent to your inbox."
    >
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
