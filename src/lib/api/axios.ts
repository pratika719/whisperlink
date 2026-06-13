import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const isPublicPath =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/u/");

      if (!isPublicPath) {
        // Dynamically import to avoid circular dependencies
        import("@/features/auth/store/auth.store").then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
