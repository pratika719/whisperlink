"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionsResponseSchema = void 0;
const zod_1 = require("zod");
exports.suggestionsResponseSchema = zod_1.z.object({
    suggestions: zod_1.z.array(zod_1.z.string()).length(5),
});
