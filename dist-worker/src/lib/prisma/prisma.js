"use strict";
// =============================================================================
// src/lib/prisma/prisma.ts — THE PRISMA CLIENT SINGLETON (Prisma 7)
// =============================================================================
//
// WHAT IS THE PRISMA CLIENT?
// PrismaClient is the object you use to query your database.
// It's the bridge between your TypeScript code and PostgreSQL.
//
// PRISMA 7 BREAKING CHANGE: THE ADAPTER PATTERN
// ============================================================================
//
// In Prisma 6 and earlier, PrismaClient connected to the database BY ITSELF
// by reading DATABASE_URL and spinning up an internal engine binary:
//
//   // Old way (Prisma ≤ 6):
//   const prisma = new PrismaClient()  // finds DATABASE_URL on its own
//
// In Prisma 7, the client is DECOUPLED from the database driver.
// You must explicitly provide an "adapter" that handles the actual
// database connection. This gives you:
//   - Choice of connection pooling strategy (pg, neon, etc.)
//   - Better edge runtime support (Vercel Edge, Cloudflare Workers)
//   - Fine-grained control over connection configuration
//
// We use @prisma/adapter-pg which wraps the "pg" (node-postgres) driver.
// pg is the most mature, battle-tested PostgreSQL driver for Node.js.
//
// HOW IT WORKS:
//   1. `pg.Pool` creates a connection POOL (multiple reusable connections)
//   2. `PrismaPg` wraps the pool and translates Prisma queries → pg driver format
//   3. `PrismaClient` uses PrismaPg as its database communication layer
//
// WHAT IS A CONNECTION POOL?
// Instead of opening and closing a new TCP connection for every query
// (expensive: ~50ms per connection), a pool keeps N connections OPEN
// and reuses them. Think of it like a taxi stand vs. calling a taxi each time.
// pg.Pool defaults to max 10 connections — perfect for serverless.
//
// =============================================================================
// THE SINGLETON PROBLEM IN NEXT.JS
// =============================================================================
//
// In development, Next.js uses "Hot Module Replacement" (HMR).
// When you save a file, Next.js re-evaluates your module files.
//
// WITHOUT a singleton:
//   - Each reload creates a NEW PrismaClient → NEW connection pool
//   - After 20 reloads: 200+ open database connections
//   - Neon's free tier connection limit → your app crashes
//
// THE FIX: Store the client on `globalThis`.
// `globalThis` persists across module reloads in the Node.js process.
// Next reload? We find the existing client on globalThis and reuse it.
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../../generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
// WHY THIS IMPORT PATH?
// The generated Prisma client is at src/generated/prisma/client.ts
// This file is at src/lib/prisma/prisma.ts
// Relative: ../../generated/prisma/client
//
// We use RELATIVE path instead of @/ alias because:
// The generated files are TypeScript files that Turbopack resolves directly.
// The @/ alias works for .ts/.tsx files in src/ but the generated client
// may need direct resolution in some bundler configurations.
// =============================================================================
// PRISMA 7 CLIENT FACTORY
// =============================================================================
function createPrismaClient() {
    // STEP 1: Create a connection pool using the pg driver
    // Pool automatically manages multiple simultaneous database connections.
    // connectionString reads DATABASE_URL directly — we bypass @t3-oss/env-nextjs
    // here because this file may load before the env validation runs.
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        // SSL required for Neon PostgreSQL (cloud database)
        // ssl: { rejectUnauthorized: false },
        // Connection pool settings for serverless/Next.js:
        max: 10, // maximum 10 concurrent connections
        idleTimeoutMillis: 30000, // close idle connections after 30s
    });
    // STEP 2: Wrap the pool in Prisma's adapter
    // PrismaPg translates Prisma's query format to the pg driver's format
    const adapter = new adapter_pg_1.PrismaPg(pool);
    // STEP 3: Create PrismaClient with the adapter
    return new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development"
            ? ["query", "warn", "error"]
            : ["error"],
    });
}
// =============================================================================
// GLOBAL SINGLETON STORAGE
// =============================================================================
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
