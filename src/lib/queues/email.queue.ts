import { Queue } from "bullmq";
import type { EmailJob } from "@/lib/jobs/email.jobs";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

export const emailQueue = new Queue<EmailJob>("email-queue", {
  connection: {
    url: redisUrl,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 60 * 60,
      count: 1000,
    },
  },
});

export async function enqueueOtpEmail(to: string, otp: string) {
  return emailQueue.add(
    "send-otp-email",
    {
      type: "SEND_OTP_EMAIL",
      payload: {
        to,
        otp,
      },
    },
    {
      jobId: `otp-email-${to}`,
    }
  );
}

export async function enqueueWelcomeEmail(to: string, name?: string) {
  return emailQueue.add("send-welcome-email", {
    type: "SEND_WELCOME_EMAIL",
    payload: {
      to,
      name,
    },
  });
}

export async function enqueuePasswordResetEmail(to: string, resetUrl: string) {
  return emailQueue.add("send-password-reset-email", {
    type: "SEND_PASSWORD_RESET_EMAIL",
    payload: {
      to,
      resetUrl,
    },
  });
}