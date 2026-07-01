"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentimentResponseSchema = void 0;
const zod_1 = require("zod");
exports.sentimentResponseSchema = zod_1.z.object({
    sentiment: zod_1.z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
    score: zod_1.z.number().min(0).max(1),
});
