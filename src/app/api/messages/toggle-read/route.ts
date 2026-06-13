import { NextRequest } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { messageRepository } from "@/repositories/message.repository";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { unauthorized, badRequest } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionCookie();
    if (!token) throw unauthorized();

    const session = await verifyAccessToken(token);
    const userId = session.sub;

    const { messageId, isRead } = await req.json();

    if (!messageId) {
      return errorResponse(badRequest("Message ID is required"));
    }

    if (typeof isRead !== "boolean") {
      return errorResponse(badRequest("isRead status must be a boolean"));
    }

    // Verify the message belongs to this user
    const message = await messageRepository.findById(messageId, userId);
    if (!message) {
      return errorResponse(badRequest("Message not found or access denied"));
    }

    await messageRepository.updateReadStatus(messageId, userId, isRead);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
