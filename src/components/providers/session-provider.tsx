"use client";

import { useSession } from "@/features/auth/hooks/use-session";

/**
 * Silent provider component — calls useSession() once at the root
 * to hydrate the Zustand auth store. Renders only its children.
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSession();
  return <>{children}</>;
}
