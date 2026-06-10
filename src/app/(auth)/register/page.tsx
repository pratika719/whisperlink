import { Metadata } from "next";

import { AuthLayout } from "@/components/ui/layout/AuthLayout";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Choose your WhisperLink handle and verify your email."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
