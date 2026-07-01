"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const brevo_client_1 = require("../lib/email/brevo-client");
const env_1 = require("../lib/env");
// ─── Shared styles injected into every email ────────────────────────────────
const base = `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #0f0f1a;
    min-height: 100vh;
    padding: 48px 16px;
  ">
    <div style="
      max-width: 480px;
      margin: 0 auto;
      background: #1a1a2e;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
    ">
      <!-- Header -->
      <div style="
        padding: 32px 40px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        text-align: center;
      ">
        <p style="
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(90deg, #818cf8, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        ">WhisperLink</p>
      </div>
`;
const footer = `
      <!-- Footer -->
      <div style="
        padding: 20px 40px;
        text-align: center;
        border-top: 1px solid rgba(255,255,255,0.06);
      ">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          You received this email because an account was created with this address on WhisperLink.
          If this wasn't you, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>
`;
// ─── Verification Email ───────────────────────────────────────────────────────
async function sendVerificationEmail(to, otp) {
    const html = `
    ${base}
    <!-- Body -->
    <div style="padding: 32px 40px;">
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #f9fafb;">
        Verify your email
      </h1>
      <p style="margin: 0 0 32px; font-size: 15px; color: #9ca3af; line-height: 1.6;">
        Enter this 6-digit code in WhisperLink to verify your account. It expires in <strong style="color: #e5e7eb;">15 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div style="
        background: #0f0f1a;
        border: 1px solid rgba(129,140,248,0.3);
        border-radius: 12px;
        padding: 28px;
        text-align: center;
        margin-bottom: 32px;
      ">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #818cf8; letter-spacing: 0.1em; text-transform: uppercase;">
          Verification Code
        </p>
        <p style="
          margin: 0;
          font-size: 40px;
          font-weight: 800;
          color: #f9fafb;
          letter-spacing: 0.25em;
          font-family: monospace;
        ">${otp}</p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
        Never share this code with anyone. WhisperLink will never ask for it.
      </p>
    </div>
    ${footer}
  `;
    await (0, brevo_client_1.sendEmail)({
        to,
        subject: "Your WhisperLink verification code: " + otp,
        html,
    });
}
// ─── Password Reset Email ─────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, resetToken) {
    const resetUrl = `${env_1.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const html = `
    ${base}
    <!-- Body -->
    <div style="padding: 32px 40px;">
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #f9fafb;">
        Reset your password
      </h1>
      <p style="margin: 0 0 32px; font-size: 15px; color: #9ca3af; line-height: 1.6;">
        We received a request to reset your WhisperLink password. Click the button below to set a new one.
        This link expires in <strong style="color: #e5e7eb;">1 hour</strong>.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            background: linear-gradient(135deg, #818cf8, #a78bfa);
            color: #ffffff;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            padding: 14px 32px;
            border-radius: 10px;
          "
        >
          Reset Password
        </a>
      </div>

      <!-- Fallback URL -->
      <div style="
        background: #0f0f1a;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      ">
        <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">
          Or copy this link into your browser:
        </p>
        <p style="margin: 0; font-size: 12px; color: #818cf8; word-break: break-all;">
          ${resetUrl}
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password won't change.
      </p>
    </div>
    ${footer}
  `;
    await (0, brevo_client_1.sendEmail)({
        to,
        subject: "Reset your WhisperLink password",
        html,
    });
}
