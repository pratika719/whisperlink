import crypto from "crypto";
import { userRepository } from "@/repositories/user.repository";
import { verificationTokenRepository } from "@/repositories/verification-token.repository";
import { ApiError } from "@/lib/api-error";

import {
  RegisterInput,
  VerifyOtpInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/schemas/auth.schema";

import {
  hashPassword,
  comparePassword,
  hashToken
} from "@/lib/auth/password";

import { enqueuePasswordResetEmail } from "@/lib/queues/email.queue";
import { createRequestId } from "@/lib/utils/request-id";



import { TokenType } from "@/repositories/verification-token.repository";
import { requestOtp, otpService } from "@/services/otp.service";
import { rateLimitService } from "@/services/rate-limit.service";
import { RATE_LIMITS } from "@/lib/rate-limit-services";
import { sessionService } from "@/services/session.service";


export const authService={
    async register(data:RegisterInput){
        const requestId = createRequestId();
        const normalizedEmail = data.email.toLowerCase().trim();
        const userByEmail = await userRepository.findByEmail(normalizedEmail);

        if (userByEmail && userByEmail.isVerified) {
            throw new ApiError(400, "Email already in use");
        }

        const userByUsername = await userRepository.findByUsername(data.username);
        
        // If a verified user already has this username, block it.
        // If an unverified user has it, and it's NOT the same user (by email), we still block it
        // because of the unique constraint in the database.
        if (userByUsername && (userByUsername.isVerified || (userByEmail && userByUsername.id !== userByEmail.id))) {
             throw new ApiError(400, "Username already in use");
        }

        const hashedPassword = await hashPassword(data.password);
        let user;

        const rateLimit = await rateLimitService.check({
            key: `register:${normalizedEmail}`,
            ...RATE_LIMITS.REGISTER,
        });

        if (!rateLimit.allowed) {
            throw new ApiError(429, `Too many registration attempts. Try again in ${rateLimit.resetInSeconds} seconds.`);
        }

        if (userByEmail) {
            // Update existing unverified user
            user = await userRepository.update(userByEmail.id, {
                username: data.username,
                password: hashedPassword,
            });
        } else {
            // Double check username uniqueness for new user creation
            if (userByUsername) {
                throw new ApiError(400, "Username already in use");
            }

            user = await userRepository.create({
                username: data.username,
                email: data.email,
                password: hashedPassword
            });
        }

        try {
            await requestOtp(user.email, requestId);
        } catch (error: unknown) {
            console.error("Failed to send verification email during registration:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            // We don't delete the user here anymore because they can now re-register/retry
            // which will just update the unverified record.
            throw new ApiError(500, errorMessage || "Failed to send verification email");
        }

        return {
          message: "Verification email sent successfully",
          user: { id: user.id, email: user.email }
        }
    },

    async verifyEmail(data:VerifyOtpInput){
        const user=await userRepository.findByEmail(data.email);

        if(!user){
            throw new ApiError(404, "User not found");
        }
        if(user.isVerified){
            return {
              success: true,
              message: "Email already verified",
            };
        }

        const result = await otpService.verifyOtp(data.email, data.otp);

        if (!result.valid) {
            throw new ApiError(
                400,
                result.reason === "OTP_EXPIRED_OR_NOT_FOUND"
                    ? "OTP expired. Please request a new one."
                    : "Invalid OTP"
            );
        }

        await userRepository.markVerified(user.id);

        return {
          success: true,
        };
    },

    async login(data:LoginInput){
        const normalizedEmail = data.email.toLowerCase().trim();
        const rateLimit = await rateLimitService.check({
            key: `login:${normalizedEmail}`,
            ...RATE_LIMITS.LOGIN,
        });

        if (!rateLimit.allowed) {
            throw new ApiError(429, `Too many login attempts. Try again in ${rateLimit.resetInSeconds} seconds.`);
        }

        const user=await userRepository.findByEmailWithPassword(normalizedEmail);
        console.log(user)

        if(!user){
            throw new ApiError(401, "Invalid credentials");
        }
        const passwordMatch=await comparePassword(data.password,user.password);
        if(!passwordMatch){
            throw new ApiError(401, "Invalid credentials");
        }
        if(!user.isVerified){
            throw new ApiError(403, "User not verified");
        }
        //  const token = await generateAccessToken({
        //     sub: user.id,
        //     username: user.username,
        //     email: user.email
        //  })

        const sessionResult=await sessionService.createSession({
            userId:user.id,
            email:user.email,
            username:user.username,
        })

          return {
      token: sessionResult.token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        acceptMessages:
          user.acceptMessages,
      },
    }
},

async forgotPassword(data:ForgotPasswordInput){
    const requestId = createRequestId();
    const normalizedEmail = data.email.toLowerCase().trim();
    const rateLimit = await rateLimitService.check({
        key: `forgot-password:${normalizedEmail}`,
        ...RATE_LIMITS.FORGOT_PASSWORD,
    });

    if (!rateLimit.allowed) {
        throw new ApiError(429, `Too many password reset requests. Try again in ${rateLimit.resetInSeconds} seconds.`);
    }

    const user=await userRepository.findByEmail(normalizedEmail);

    if(!user){
        // Return success even if user not found for security
        return{
            success:true,
        }
    }

    const latest = await verificationTokenRepository.findLatestByUserAndType(
        user.id,
        TokenType.PASSWORD_RESET
    );

    if (latest && Date.now() - latest.createdAt.getTime() < 60 * 1000) {
        throw new ApiError(429, "Please wait 60 seconds before requesting another reset email");
    }

    await verificationTokenRepository.deleteByUserAndType(
        user.id,
        TokenType.PASSWORD_RESET
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    const expiresAt=new Date(
        Date.now()+60*60*1000
    )

    await verificationTokenRepository.create(
        user.id,
        hashedToken,
        TokenType.PASSWORD_RESET,
        expiresAt
    )

     try {
          await enqueuePasswordResetEmail(user.email, rawToken, requestId);
      } catch (error: unknown) {
          console.error("Failed to enqueue password reset email:", error);
          throw new ApiError(500, "Failed to send reset email");
      }

    return {
        success:true,
    }

},
  async resetPassword(
    data: ResetPasswordInput
  ) {
    const hashedToken = hashToken(data.token);
    const record =
      await verificationTokenRepository.findByToken(
        hashedToken
      );

    if (!record) {
      throw new ApiError(400, "Invalid or expired token");
    }

    if (
      record.expiresAt.getTime() <
      Date.now()
    ) {
      await verificationTokenRepository.deleteByToken(
        record.token
      );

      throw new ApiError(400, "Token expired");
    }

    const hashedPassword =
      await hashPassword(
        data.password
      );

    await Promise.all([
      userRepository.updatePassword(
        record.userId,
        hashedPassword
      ),

      verificationTokenRepository.deleteByUserAndType(
        record.userId,
        TokenType.PASSWORD_RESET
      ),
    ]);

    return {
      success: true,
    };
  },

  async resendVerificationEmail(email: string) {
    const requestId = createRequestId();
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Return success for security
      return { success: true };
    }

    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    // Rate-limit check using Redis TTL (original is 10 min = 600s; limit if requested within 60s, i.e. TTL > 540s)
    const ttl = await otpService.getOtpTtl(email);
    if (ttl > 540) {
      throw new ApiError(429, "Please wait 60 seconds before requesting a new verification code");
    }

    try {
        await requestOtp(email, requestId);
    } catch (error: unknown) {
        console.error("Failed to resend verification email:", error);
        throw new ApiError(500, "Failed to send verification email");
    }

    return { success: true };
  },



}
