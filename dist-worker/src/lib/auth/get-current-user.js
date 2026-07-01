"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
const prisma_1 = require("../../lib/prisma/prisma");
const cookies_1 = require("../../lib/auth/cookies");
const session_service_1 = require("../../services/session.service");
async function getCurrentUser() {
    const token = await (0, cookies_1.getSessionCookie)();
    if (!token) {
        return null;
    }
    const session = await session_service_1.sessionService.getSession(token);
    if (!session) {
        return null;
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: session.userId,
        },
    });
    if (!user) {
        await session_service_1.sessionService.deleteSession(token);
        return null;
    }
    return user;
}
