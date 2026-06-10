import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/ui/layout/DashboardLayout";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionCookie();

  if (!token) {
    redirect("/login");
  }

  const user = await verifyAccessToken(token);

  return (
    <DashboardLayout
      user={{
        username: user.username,
        email: user.email,
      }}
    >
      {children}
    </DashboardLayout>
  );
}

//check cookie then reder if not redired=ct to login

