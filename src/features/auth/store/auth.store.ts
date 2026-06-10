import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;

  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  hydrate: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "loading",

      setUser: (user) => set({ user }),
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
    }),
    {
      name: "whisperlink-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        status: state.status,
      }),
    }
  )
);

//define interface type
//function for store use create persist->for browser refresh
//Partialize->for save only required fileld
//store in session storage
//set for updates
