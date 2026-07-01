import { Worker, Job } from "bullmq";
import type { EmailJob } from "@/lib/jobs/email.jobs";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/email.service";
import { logger } from "@/lib/logger";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is missing");
}

async function processEmailJob(job: Job<EmailJob>) {
  const data = job.data;
  const requestId = data.payload.requestId;

  logger.info({
    event: "email_job_started",
    requestId,
    jobId: job.id,
    jobName: job.name,
    jobType: data.type,
  });

  switch (data.type) {
    case "SEND_OTP_EMAIL": {
      await sendVerificationEmail(
        data.payload.to,
        data.payload.otp
      );
      break;
    }

    case "SEND_WELCOME_EMAIL": {
      logger.warn({
        event: "welcome_email_not_implemented",
        requestId,
        jobId: job.id,
      });
      break;
    }

    case "SEND_PASSWORD_RESET_EMAIL": {
      await sendPasswordResetEmail(
        data.payload.to,
        data.payload.token
      );
      break;
    }

    default: {
      const exhaustiveCheck: never = data;
      throw new Error(`Unknown email job type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }

  logger.info({
    event: "email_job_completed",
    requestId,
    jobId: job.id,
    jobType: data.type,
  });
}

export const emailWorker = new Worker<EmailJob>(
  "email-queue",
  processEmailJob,
  {
    connection: {
      url: redisUrl,
    },
    concurrency: 5,
  }
);

emailWorker.on("completed", (job) => {
  logger.info({
    event: "bullmq_job_completed",
    jobId: job.id,
    queue: "email-queue",
  });
});

emailWorker.on("failed", (job, error) => {
  logger.error({
    event: "bullmq_job_failed",
    jobId: job?.id,
    queue: "email-queue",
    attemptsMade: job?.attemptsMade,
    error: error.message,
    stack: error.stack,
  });
});

emailWorker.on("error", (error) => {
  logger.error({
    event: "bullmq_worker_error",
    queue: "email-queue",
    error: error.message,
    stack: error.stack,
  });
});

logger.info({
  event: "email_worker_started",
  queue: "email-queue",
});