// Quick smoke test for Nodemailer — run with:
//   npx tsx src/scripts/test-email.ts your-real-email@gmail.com
//
// This directly calls Nodemailer without going through Next.js.

import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;
const toEmail = process.argv[2];

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error("❌ SMTP configuration is missing in .env");
  process.exit(1);
}

if (!emailFrom) {
  console.error("❌ EMAIL_FROM is missing in .env");
  process.exit(1);
}

if (!toEmail) {
  console.error("❌ Usage: npx tsx src/scripts/test-email.ts <your-email>");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

async function main() {
  console.log(`\n📧 Sending test email to: ${toEmail}`);
  console.log(`   From: ${emailFrom}`);
  console.log(`   SMTP Host: ${smtpHost}`);

  try {
    const info = await transporter.sendMail({
      from: emailFrom!,
      to: toEmail,
      subject: "WhisperLink — Nodemailer Email Test ✅",
      html: `
        <div style="font-family:sans-serif;background:#0f0f1a;padding:40px;border-radius:16px;max-width:480px;margin:0 auto;">
          <h2 style="color:#818cf8;">✅ Nodemailer is working!</h2>
          <p style="color:#9ca3af;">Your WhisperLink email configuration is correctly set up using Nodemailer.</p>
          <p style="color:#9ca3af;">SMTP Host: <code style="color:#f9fafb;">${smtpHost}</code></p>
          <p style="color:#9ca3af;">From: <code style="color:#f9fafb;">${emailFrom}</code></p>
        </div>
      `,
    });

    console.log("\n✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("\n👉 Check your inbox (and spam folder).");
  } catch (error: any) {
    console.error("\n❌ Nodemailer returned an error:");
    console.error(error.message);
    console.log("\n💡 Common causes:");
    console.log("   • SMTP credentials are incorrect");
    console.log("   • SMTP host or port is incorrect");
    console.log("   • Firewalls are blocking the connection");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});
