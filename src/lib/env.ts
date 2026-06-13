// =============================================================================
// src/lib/env.ts — ENVIRONMENT VARIABLE VALIDATION
// =============================================================================
//
// WHAT IS ENVIRONMENT VALIDATION AND WHY DOES IT MATTER?
//
// Environment variables are the way you inject secrets and configuration
// into your application without hardcoding them. But they have a serious
// problem: process.env values are ALL typed as `string | undefined` in
// TypeScript. This means:
//
//   process.env.DATABASE_URL  →  string | undefined (TypeScript doesn't know)
//
// Without validation, this can happen:
//   1. You deploy to Vercel and forget to add SMTP_HOST
//   2. process.env.SMTP_HOST is undefined
//   3. Your email service silently fails at runtime
//   4. You find out from an angry user, not at startup
//
// WITH environment validation:
//   1. Your app checks ALL required env vars at STARTUP
//   2. If any are missing: crash immediately with a clear error message
//   3. "Fast fail" — you know within seconds of deployment, not hours later
//
// REAL PRODUCTION STORY:
// Every major incident involving "env vars not set" could have been prevented
// with startup validation. This is a non-negotiable in production systems.
//
// =============================================================================
// HOW @t3-oss/env-nextjs WORKS
// =============================================================================
//
// This library was created by the T3 Stack team (creators of create-t3-app).
// It wraps Zod to validate environment variables with two key features:
//
// 1. TREE-SHAKING: Variables in `server` are NEVER sent to the browser.
//    If you accidentally import a server-only env var in a client component,
//    the build will FAIL with a clear error.
//
// 2. TYPE SAFETY: After validation, env.DATABASE_URL is typed as `string`
//    (not `string | undefined`), so TypeScript trusts it everywhere you use it.

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // ==========================================================================
  // SERVER-SIDE VARIABLES
  // These are NEVER sent to the browser. They contain secrets.
  // If you try to import `env.DATABASE_URL` in a client component ("use client"),
  // the library will throw at build time.
  // ==========================================================================
  server: {
    // DATABASE CONNECTION
    // z.string().url() validates:
    //   - Must be a string
    //   - Must be a valid URL format (postgresql://...)
    // If DATABASE_URL is missing or malformed → crash at startup with a clear message
    DATABASE_URL: z.string().url(),

    // AUTH SECRET — used to sign JWT tokens / session cookies
    // z.string().min(32) enforces it's at least 32 characters.
    // WHY 32? Security requirement — shorter secrets can be brute-forced.
    // Generate one with: openssl rand -base64 32
    AUTH_SECRET: z.string().min(32),

    // SMTP CONFIGURATION
    // Nodemailer will use these to send emails via SMTP.
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),

    // GROQ API KEY
    // Used for AI features: message analysis, response suggestions.
    // Keys look like: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    GROQ_API_KEY: z.string().min(20),

    EMAIL_FROM: z.string().email(),

    // NODE_ENV — which environment are we running in?
    // z.enum() restricts to ONLY these three values.
    // This prevents typos like NODE_ENV=developement (note the typo).
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  // ==========================================================================
  // CLIENT-SIDE VARIABLES
  // These ARE sent to the browser — they must be safe to expose publicly.
  // In Next.js, client env vars MUST start with NEXT_PUBLIC_
  // ==========================================================================
  client: {
    // Safe to expose publicly — used for constructing absolute URLs in emails etc.
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  // ==========================================================================
  // RUNTIME ENV MAPPING
  // This tells the library WHERE to find the actual values at runtime.
  // You must list every variable from server{} and client{} here.
  //
  // WHY IS THIS NEEDED?
  // Next.js bundles your app at build time. For client-side code, it statically
  // replaces process.env.NEXT_PUBLIC_X with the actual value. This mapping
  // tells the library which process.env keys to read at runtime.
  // ==========================================================================
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // SKIP VALIDATION IN CI/BUILD when env vars aren't available
  // This allows `next build` to succeed without all env vars set
  // (useful in CI pipelines that build without production secrets)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

// =============================================================================
// HOW TO USE THIS IN YOUR CODE:
//
//   import { env } from '@/lib/env'
//
//   // TypeScript knows this is `string`, not `string | undefined`
//   const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL })
//
// COMMON MISTAKE: Using process.env directly instead of env.
//   BAD:  process.env.DATABASE_URL  → typed as string | undefined
//   GOOD: env.DATABASE_URL          → typed as string (validated at startup)
// =============================================================================