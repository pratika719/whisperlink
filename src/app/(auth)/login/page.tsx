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


//suspence here is used for adding streaming or loading skeletons in the page to improv ux 
//if you remove suspense, then the page will not render until the query is resolved
