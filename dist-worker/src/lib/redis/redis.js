"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is missing in environment variables");
}
exports.redis = global.redis ??
    new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
    });
if (process.env.NODE_ENV !== "production") {
    global.redis = exports.redis;
}
