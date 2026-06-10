import { api } from "@/lib/api/axios";
import {
  ApiResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/features/auth/types/auth.types";

export const authClient = {
  register(data: RegisterInput) {
    return api.post<
      ApiResponse<{
        message: string;
        user: { id: string; email: string };
      }>
    >("/auth/register", data);
  },

  login(data: LoginInput) {
    return api.post<
      ApiResponse<{
        user: AuthUser;
        message: string;
      }>
    >("/auth/login", data);
  },

  verifyEmail(data: VerifyOtpInput) {
    return api.post<ApiResponse<{ success: boolean; message?: string }>>(
      "/auth/verify-email",
      data
    );
  },

  resendVerification(email: string) {
    return api.post<ApiResponse<{ success: boolean; message?: string }>>(
      "/auth/resend-verification",
      { email }
    );
  },

  forgotPassword(data: ForgotPasswordInput) {
    return api.post<ApiResponse<{ success: boolean }>>(
      "/auth/forgot-password",
      data
    );
  },

  resetPassword(data: ResetPasswordInput) {
    return api.post<ApiResponse<{ success: boolean }>>(
      "/auth/reset-password",
      data
    );
  },

  logout() {
    return api.post<ApiResponse<{ success: boolean }>>("/auth/logout");
  },

  me() {
    return api.get<ApiResponse<AuthUser>>("/auth/me");
  },

  toggleAcceptMessages(acceptMessages: boolean) {
    return api.post<ApiResponse<{ acceptMessages: boolean }>>(
      "/auth/accept-messages",
      { acceptMessages }
    );
  },
};
