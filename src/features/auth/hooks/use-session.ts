"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/features/auth/api/auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useEffect } from "react";

/**
 * Fetches the current session from /api/auth/me and hydrates
 * the Zustand auth store. Should be called once at the root level
 * via <SessionProvider />.
 */
export function useSession() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await authClient.me();
      return res.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      hydrate(query.data);
    } else if (query.isError) {
      logout();
    }
  }, [query.data, query.isError, hydrate, logout]);

  return query;
}
