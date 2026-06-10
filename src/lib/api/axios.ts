import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── 401 Interceptor ──────────────────────────────────────────────────
// If the server responds with 401 (expired/invalid token), clear any
// client-side auth state and redirect to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      // Dynamically import to avoid circular dependencies
      import("@/features/auth/store/auth.store").then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
