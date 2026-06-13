
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { messageRepository } from "@/repositories/message.repository";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { unauthorized } from "@/lib/errors";

export async function POST() {
  try {
    const token = await getSessionCookie();
    if (!token) throw unauthorized();

    const session = await verifyAccessToken(token);
    const userId = session.sub;

    await messageRepository.markAllAsRead(userId);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
