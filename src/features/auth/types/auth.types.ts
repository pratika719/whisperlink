export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  message?: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  acceptMessages: boolean;
}
