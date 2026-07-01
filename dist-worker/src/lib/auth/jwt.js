"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = verifyAccessToken;
exports.verifyTokenSafe = verifyTokenSafe;
const env_1 = require("../../lib/env");
const session_service_1 = require("../../services/session.service");
const secret = new TextEncoder().encode(env_1.env.AUTH_SECRET);
// Deprecated: generateAccessToken is kept for backwards compatibility
// export async function generateAccessToken(
//     payload: jwtPayload
// ): Promise<string> {
//     return await new SignJWT({
//         email: payload.email,
//         username: payload.username,
//     })
//     .setProtectedHeader({ alg: "HS256" })
//     .setSubject(payload.sub)
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);
// }
async function verifyAccessToken(token) {
    const session = await session_service_1.sessionService.getSession(token);
    if (!session) {
        throw new Error("Session expired or invalid");
    }
    // Sliding window expiration: extend the session TTL on access
    await session_service_1.sessionService.refreshSession(token);
    return {
        sub: session.userId,
        email: session.email,
        username: session.username,
        createdAt: session.createdAt,
    };
}
async function verifyTokenSafe(token) {
    try {
        return await verifyAccessToken(token);
    }
    catch {
        return null;
    }
}
