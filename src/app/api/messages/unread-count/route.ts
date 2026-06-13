
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { messageRepository } from "@/repositories/message.repository";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { unauthorized } from "@/lib/errors";

export async function GET() {
  try {
    const token = await getSessionCookie();
    if (!token) throw unauthorized();

    const session = await verifyAccessToken(token);
    const userId = session.sub;

    const count = await messageRepository.countUnread(userId);

    return successResponse({ count });
  } catch (error) {
    return errorResponse(error);
  }
}
