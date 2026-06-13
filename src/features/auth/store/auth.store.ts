import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types/auth.types";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;

  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  hydrate: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",

  setUser: (user) =>
    set({
      user,
      status: user ? "authenticated" : "unauthenticated",
    }),

  setStatus: (status) => set({ status }),

  hydrate: (user) =>
    set({
      user,
      status: "authenticated",
    }),

  logout: () =>
    set({
      user: null,
      status: "unauthenticated",
    }),
}));