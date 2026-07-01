// Quick smoke test for Brevo — run with:
//   npx tsx src/scripts/test-email.ts your-real-email@gmail.com
//
// This directly calls our Brevo email service.

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// We will import the client dynamically inside main() after env variables are loaded.

const emailFrom = process.env.EMAIL_FROM;
const toEmail = process.argv[2];

if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is missing in .env");
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

async function main() {
  const { sendEmail } = await import("../lib/email/brevo-client");

  console.log(`\n📧 Sending test email via Brevo to: ${toEmail}`);
  console.log(`   From: ${emailFrom}`);

  try {
    await sendEmail({
      to: toEmail,
      subject: "WhisperLink — Brevo Email Test ✅",
      html: `
        <div style="font-family:sans-serif;background:#0f0f1a;padding:40px;border-radius:16px;max-width:480px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#818cf8;margin-bottom:16px;">✅ Brevo is working!</h2>
          <p style="color:#9ca3af;line-height:1.6;">Your WhisperLink email configuration is correctly set up using Brevo SMTP API.</p>
          <p style="color:#9ca3af;">From: <code style="color:#f9fafb;">${emailFrom}</code></p>
        </div>
      `,
    });

    console.log("\n✅ Email sent successfully!");
    console.log("👉 Check your inbox (and spam folder).");
  } catch (error) {
    const err = error as Error;
    console.error("\n❌ Brevo returned an error:");
    console.error(err.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});
