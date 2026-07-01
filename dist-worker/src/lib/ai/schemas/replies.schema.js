"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repliesResponseSchema = void 0;
const zod_1 = require("zod");
exports.repliesResponseSchema = zod_1.z.object({
    casual: zod_1.z.string().min(1),
    witty: zod_1.z.string().min(1),
    thoughtful: zod_1.z.string().min(1),
});
