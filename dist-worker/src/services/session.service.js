"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../lib/redis/redis");
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
function getSessionKey(token) {
    return `session:${token}`;
}
function createSessionToken() {
    return crypto_1.default.randomBytes(32).toString("hex");
}
exports.sessionService = {
    async createSession(data) {
        const token = createSessionToken();
        const sessionData = {
            ...data,
            createdAt: new Date().toISOString(),
        };
        await redis_1.redis.set(getSessionKey(token), JSON.stringify(sessionData), "EX", SESSION_TTL_SECONDS);
        return {
            token,
            session: sessionData,
            expiresInSeconds: SESSION_TTL_SECONDS,
        };
    },
    async getSession(token) {
        const sessionKey = getSessionKey(token);
        const sessionJson = await redis_1.redis.get(sessionKey);
        if (!sessionJson) {
            return null;
        }
        return JSON.parse(sessionJson);
    },
    async deleteSession(token) {
        const sessionKey = getSessionKey(token);
        await redis_1.redis.del(sessionKey);
    },
    async refreshSession(token) {
        const key = getSessionKey(token);
        const exist = await redis_1.redis.exists(key);
        if (!exist) {
            return false;
        }
        await redis_1.redis.expire(key, SESSION_TTL_SECONDS);
        return true;
    }
};
