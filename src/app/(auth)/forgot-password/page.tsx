import { Metadata } from "next";

import { AuthLayout } from "@/components/ui/layout/AuthLayout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="We will send a secure reset link if the email exists."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}


