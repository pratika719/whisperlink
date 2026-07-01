"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
exports.getsessionPayload = getsessionPayload;
const jose_1 = require("jose");
const env_1 = require("../../lib/env");
const secret = new TextEncoder().encode(env_1.env.AUTH_SECRET);
const SESSION_DURATION = 60 * 60 * 24 * 7; //1 week
async function createSessionToken(payload) {
    return await new jose_1.SignJWT(payload)
        .setProtectedHeader({
        alg: "HS256",
    })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(secret);
}
async function verifySessionToken(token) {
    const { payload } = await (0, jose_1.jwtVerify)(token, secret);
    return {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
    };
}
async function getsessionPayload(token) {
    if (!token) {
        return null;
    }
    try {
        return await verifySessionToken(token);
    }
    catch {
        return null;
    }
}
