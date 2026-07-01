// prisma.config.ts
//
// WHY THIS FILE EXISTS:
// Prisma 7+ introduced a config file (prisma.config.ts) to replace the old
// CLI flags. Instead of passing --schema on every command, this file tells
// Prisma where your schema lives, where migrations go, and how to connect
// to your database. Think of it as Prisma's "settings file".
//
// WHY @next/env?
// Next.js automatically loads environment variables, but Prisma CLI runs as a
// standalone Node process — NOT inside Next.js. So it can't read files on its own.
// We use Next.js's native `loadEnvConfig` loader to parse and load environment
// variables (including .env and .env.local overrides) exactly like Next.js does.

import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load Next.js environment configuration (merges .env and .env.local)
loadEnvConfig(process.cwd());

export default defineConfig({
  // WHERE IS YOUR SCHEMA?
  // This path is relative to this config file (project root).
  // We keep the schema inside src/lib/prisma/ to co-locate it with
  // the Prisma client singleton — everything Prisma-related in one folder.
  schema: "src/lib/prisma/schema.prisma",

  // WHERE DO MIGRATIONS LIVE?
  // Migrations are SQL files that record every change to your DB structure.
  // Think of them like "git commits for your database schema".
  migrations: {
    path: "prisma/migrations",
  },

  // DATABASE CONNECTION
  // We read the URL from .env — never hardcode DB credentials.
  // The `process.env["DATABASE_URL"]` bracket notation prevents TypeScript
  // from complaining if the key might be undefined.
  datasource: {
    url: process.env["DATABASE_URL"]
  }
});
