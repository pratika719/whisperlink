import crypto from "crypto";
import { redis } from "@/lib/redis/redis";
import { sendVerificationEmail } from "@/services/email.service";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_LENGTH = 6;

function getOtpKey(identifier: string) {
  return `otp:${identifier}`;
}

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;

  return crypto.randomInt(min, max + 1).toString();
}

export const otpService = {
  generateOtp,

  async saveOtp(identifier: string, otp: string) {
    const key = getOtpKey(identifier);
    const hashedOtp = hashOtp(otp);

    await redis.set(key, hashedOtp, "EX", OTP_TTL_SECONDS);
  },

  async verifyOtp(identifier: string, otp: string) {
    const key = getOtpKey(identifier);

    const storedHashedOtp = await redis.get(key);

    if (!storedHashedOtp) {
      return {
        valid: false,
        reason: "OTP_EXPIRED_OR_NOT_FOUND" as const,
      };
    }

    const incomingHashedOtp = hashOtp(otp);

    if (incomingHashedOtp !== storedHashedOtp) {
      return {
        valid: false,
        reason: "OTP_INVALID" as const,
      };
    }

    await redis.del(key);

    return {
      valid: true,
      reason: null,
    };
  },

  async deleteOtp(identifier: string) {
    const key = getOtpKey(identifier);
    await redis.del(key);
  },

  async getOtpTtl(identifier: string) {
    const key = getOtpKey(identifier);
    return redis.ttl(key);
  },


};

export async function requestOtp(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Validate email before this using Zod.

  // 2. Find or create user depending on your current flow.
  // const user = await userRepository.findByEmail(normalizedEmail);
  // if (!user) throw new Error("User not found");

  // 3. Generate OTP.
  const otp = otpService.generateOtp();

  // 4. Save OTP in Redis.
  await otpService.saveOtp(normalizedEmail, otp);

  // 5. Send email directly for now.
  await sendVerificationEmail(normalizedEmail, otp);

  return {
    success: true,
    message: "OTP sent successfully",
  };
}

export async function verifyOtp(email: string, otp: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Validate email and OTP using Zod before this.

  // 2. Verify OTP from Redis.
  const result = await otpService.verifyOtp(normalizedEmail, otp);

  if (!result.valid) {
    return {
      success: false,
      message:
        result.reason === "OTP_EXPIRED_OR_NOT_FOUND"
          ? "OTP expired. Please request a new one."
          : "Invalid OTP.",
    };
  }

  // 3. Update persistent user data in PostgreSQL.
  // await userRepository.markEmailVerified(normalizedEmail);

  return {
    success: true,
    message: "OTP verified successfully",
  };
}