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

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/services/email.service";

import { generateAccessToken } from "@/lib/auth/jwt";

import { TokenType } from "@/repositories/verification-token.repository";


export const authService={
    async register(data:RegisterInput){
        const userByEmail = await userRepository.findByEmail(data.email);

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

        const rawOtp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = hashToken(rawOtp);

        await verificationTokenRepository.deleteByUserAndType(
            user.id,
            TokenType.EMAIL_VERIFICATION
        );

       const expiresAt=new Date(
        Date.now()+15*60*1000
       );

       await verificationTokenRepository.create(
        user.id,
        hashedOtp,
        TokenType.EMAIL_VERIFICATION,
        expiresAt
       )

       try {
           await sendVerificationEmail(
            user.email,
            rawOtp
           );
       } catch (error: unknown) {
           console.error("Failed to send verification email during registration:", error);
           const errorMessage = error instanceof Error ? error.message : "Unknown error";
           // We don't delete the user here anymore because they can now re-register/retry
           // which will just update the unverified record.
           throw new ApiError(500, errorMessage || "Failed to send verification email");
       }

       return{
        message:"Verification email sent successfully",
        user:{id:user.id,email:user.email}
       }
    },

    async verifyEmail(data:VerifyOtpInput){
        const user=await userRepository.findByEmail(data.email);

        if(!user){
            throw new ApiError(404, "User not found");
        }
        if(user.isVerified){
            await verificationTokenRepository.deleteByUserAndType(
              user.id,
              TokenType.EMAIL_VERIFICATION
            );

            return {
              success: true,
              message: "Email already verified",
            };
        }

        const token= await verificationTokenRepository.findLatestByUserAndType(
      user.id,
      TokenType.EMAIL_VERIFICATION
    );

     if (!token) {
      throw new ApiError(400, "No pending verification");
    }

    if (
      token.expiresAt.getTime() <
      Date.now()
    ) {
      await verificationTokenRepository.deleteByToken(
        token.token
      );

      throw new ApiError(400, "OTP expired");
    }

    const hashedInputOtp = hashToken(data.otp);

    if (token.token.length !== hashedInputOtp.length) {
      throw new ApiError(400, "Invalid OTP");
    }

    const validOtp = crypto.timingSafeEqual(
      Buffer.from(token.token),
      Buffer.from(hashedInputOtp)
    );

 
    if (!validOtp) {
      // Delete the OTP immediately on failed attempt to prevent brute-forcing
      await verificationTokenRepository.deleteByToken(token.token);
      throw new ApiError(400, "Invalid OTP. A new code has been requested.");
    }

    await Promise.all([
      userRepository.markVerified(
        user.id
      ),
      verificationTokenRepository.deleteByToken(
        token.token
      ),
    ]);

    return {
      success: true,
    };
  

    },

    async login(data:LoginInput){
        const user=await userRepository.findByEmailWithPassword(data.email);
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
         const token = await generateAccessToken({
            sub: user.id,
            username: user.username,
            email: user.email
         })

          return {
      token,
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
    const user=await userRepository.findByEmail(data.email);

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
         await sendPasswordResetEmail(user.email, rawToken);
     } catch (error: unknown) {
         console.error("Failed to send password reset email:", error);
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
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Return success for security
    return { success: true };
  }

  if (user.isVerified) {
    await verificationTokenRepository.deleteByUserAndType(
      user.id,
      TokenType.EMAIL_VERIFICATION
    );

    return {
      success: true,
      message: "Email already verified",
    };
  }

  const latest = await verificationTokenRepository.findLatestByUserAndType(
    user.id,
    TokenType.EMAIL_VERIFICATION
  );

  if (latest && Date.now() - latest.createdAt.getTime() < 60 * 1000) {
    throw new ApiError(429, "Please wait 60 seconds before requesting a new verification code");
  }

  await verificationTokenRepository.deleteByUserAndType(
    user.id,
    TokenType.EMAIL_VERIFICATION
  );

  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = hashToken(rawOtp);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await verificationTokenRepository.create(
    user.id,
    hashedOtp,
    TokenType.EMAIL_VERIFICATION,
    expiresAt
  );

  try {
      await sendVerificationEmail(user.email, rawOtp);
  } catch (error: unknown) {
      console.error("Failed to resend verification email:", error);
      throw new ApiError(500, "Failed to send verification email");
  }

  return { success: true };
},



}
