import { z } from "zod";

export const RegisterSchema = z.object({
  username:z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username cannot exceed 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  ),
email:z
.email("invalid email address")
.toLowerCase()
.trim(),

password:z
.string()
.min(6, "password must be at least 6 characters long")
.max(100, "password cannot exceed 100 characters")

})

export const LoginSchema=z.object({
  email:z
  .email("invalid emiail address")
  .toLowerCase()
  .trim(),

  password:z
  .string()
  .min(1,"password is required")
  
});
export const VerifyOtpSchema = z.object({
  email: z
    .email("Invalid email address")
    .toLowerCase()
    .trim(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});




export const ForgotPasswordSchema = z.object({
  email: z
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

/**
 * Reset Password
 */

//zpd is used for input validation parsing and cleaning incoming request data
//
export const ResetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Token is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type RegisterInput=z.infer<typeof RegisterSchema>
export type LoginInput=z.infer<typeof LoginSchema>
export type VerifyOtpInput=z.infer<typeof VerifyOtpSchema>
export type ForgotPasswordInput=z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput=z.infer<typeof ResetPasswordSchema>