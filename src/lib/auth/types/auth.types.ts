// Register

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
}

// Verify Email

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
}

// Login

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  acceptMessages: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Forgot Password

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
}

// Reset Password

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}

// Current User

export interface CurrentUserResponse {
  user: AuthUser;
}

// Logout

export interface LogoutResponse {
  success: boolean;
}