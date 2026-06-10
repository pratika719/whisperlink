import { useAuthStore } from "@/features/auth/store/auth.store";

/** Returns the current authenticated user, or null. */
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

/** Returns the auth status: 'loading' | 'authenticated' | 'unauthenticated'. */
export function useAuthStatus() {
  return useAuthStore((s) => s.status);
}

/** Returns true while the initial session check is in-flight. */
export function useIsAuthLoading() {
  return useAuthStore((s) => s.status === "loading");
}
