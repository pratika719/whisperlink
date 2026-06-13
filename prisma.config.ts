// prisma.config.ts
//
// WHY THIS FILE EXISTS:
// Prisma 7+ introduced a config file (prisma.config.ts) to replace the old
// CLI flags. Instead of passing --schema on every command, this file tells
// Prisma where your schema lives, where migrations go, and how to connect
// to your database. Think of it as Prisma's "settings file".
//
// WHY dotenv/config?
// Next.js automatically loads .env, but Prisma CLI runs as a stand alone Node
// process — NOT inside Next.js. So it can't read .env on its own.
// `import "dotenv/config"` manually loads your .env file so that
// process.env.DATABASE_URL is available when Prisma CLI runs.

import "dotenv/config";
import { defineConfig } from "prisma/config";

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
