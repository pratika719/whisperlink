import { Suspense } from "react";
import { Metadata } from "next";

import { AuthLayout } from "@/components/ui/layout/AuthLayout";
import { Spinner } from "@/components/spinner";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      description="Use a strong password that you have not used elsewhere."
    >
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
