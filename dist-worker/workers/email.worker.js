"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const email_service_1 = require("../src/services/email.service");
const logger_1 = require("../src/lib/logger");
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is missing");
}
async function processEmailJob(job) {
    const data = job.data;
    const requestId = data.payload.requestId;
    logger_1.logger.info({
        event: "email_job_started",
        requestId,
        jobId: job.id,
        jobName: job.name,
        jobType: data.type,
    });
    switch (data.type) {
        case "SEND_OTP_EMAIL": {
            await (0, email_service_1.sendVerificationEmail)(data.payload.to, data.payload.otp);
            break;
        }
        case "SEND_WELCOME_EMAIL": {
            logger_1.logger.warn({
                event: "welcome_email_not_implemented",
                requestId,
                jobId: job.id,
            });
            break;
        }
        case "SEND_PASSWORD_RESET_EMAIL": {
            await (0, email_service_1.sendPasswordResetEmail)(data.payload.to, data.payload.token);
            break;
        }
        default: {
            const exhaustiveCheck = data;
            throw new Error(`Unknown email job type: ${JSON.stringify(exhaustiveCheck)}`);
        }
    }
    logger_1.logger.info({
        event: "email_job_completed",
        requestId,
        jobId: job.id,
        jobType: data.type,
    });
}
exports.emailWorker = new bullmq_1.Worker("email-queue", processEmailJob, {
    connection: {
        url: redisUrl,
    },
    concurrency: 5,
});
exports.emailWorker.on("completed", (job) => {
    logger_1.logger.info({
        event: "bullmq_job_completed",
        jobId: job.id,
        queue: "email-queue",
    });
});
exports.emailWorker.on("failed", (job, error) => {
    logger_1.logger.error({
        event: "bullmq_job_failed",
        jobId: job?.id,
        queue: "email-queue",
        attemptsMade: job?.attemptsMade,
        error: error.message,
        stack: error.stack,
    });
});
exports.emailWorker.on("error", (error) => {
    logger_1.logger.error({
        event: "bullmq_worker_error",
        queue: "email-queue",
        error: error.message,
        stack: error.stack,
    });
});
logger_1.logger.info({
    event: "email_worker_started",
    queue: "email-queue",
});
