"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
exports.enqueueOtpEmail = enqueueOtpEmail;
exports.enqueueWelcomeEmail = enqueueWelcomeEmail;
exports.enqueuePasswordResetEmail = enqueuePasswordResetEmail;
const bullmq_1 = require("bullmq");
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is missing");
}
exports.emailQueue = new bullmq_1.Queue("email-queue", {
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
async function enqueueOtpEmail(to, otp, requestId) {
    return exports.emailQueue.add("send-otp-email", {
        type: "SEND_OTP_EMAIL",
        payload: {
            to,
            otp,
            requestId,
        },
    });
}
async function enqueueWelcomeEmail(to, name) {
    return exports.emailQueue.add("send-welcome-email", {
        type: "SEND_WELCOME_EMAIL",
        payload: {
            to,
            name,
        },
    });
}
async function enqueuePasswordResetEmail(to, token, requestId) {
    return exports.emailQueue.add("send-password-reset-email", {
        type: "SEND_PASSWORD_RESET_EMAIL",
        payload: {
            to,
            token,
            requestId,
        },
    });
}
