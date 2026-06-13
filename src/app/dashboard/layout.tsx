import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/ui/layout/DashboardLayout";
import { clearSessionCookie, getSessionCookie } from "@/lib/auth/cookies";
import { verifyTokenSafe } from "@/lib/auth/jwt";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionCookie();

  if (!token) {
    redirect("/login");
  }
   const session = await verifyTokenSafe(token);
  if (!session) {
    redirect("/login");
  }


  const user = await verifyTokenSafe(token);
if (!user) {
  await clearSessionCookie();
  redirect("/login");
}


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



