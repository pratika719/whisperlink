"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const env_1 = require("../../lib/env");
const logger_1 = require("../../lib/logger");
async function sendEmail({ to, subject, html }) {
    logger_1.logger.info({ event: "email_send_start", to, subject });
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": env_1.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: "WhisperLink",
                    email: env_1.env.EMAIL_FROM,
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            }),
        });
        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Brevo API responded with status ${response.status}: ${responseText}`);
        }
        const data = (await response.json());
        logger_1.logger.info({ event: "email_send_success", to, subject, messageId: data.messageId });
    }
    catch (error) {
        const errMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.error({
            event: "email_send_failure",
            to,
            subject,
            error: errMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
}
