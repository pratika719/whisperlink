"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_COOKIE_NAME = void 0;
exports.setSessionCookie = setSessionCookie;
exports.getSessionCookie = getSessionCookie;
exports.clearSessionCookie = clearSessionCookie;
const headers_1 = require("next/headers");
exports.SESSION_COOKIE_NAME = "whisperlink_session";
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
async function setSessionCookie(token) {
    const cookieStore = await (0, headers_1.cookies)();
    cookieStore.set(exports.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_COOKIE_MAX_AGE,
    });
}
async function getSessionCookie() {
    const cookieStore = await (0, headers_1.cookies)();
    return cookieStore.get(exports.SESSION_COOKIE_NAME)?.value ?? null;
}
async function clearSessionCookie() {
    const cookieStore = await (0, headers_1.cookies)();
    cookieStore.set(exports.SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0, // immediately expires
    });
}
