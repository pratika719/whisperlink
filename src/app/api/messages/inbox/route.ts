import { NextRequest } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { messageRepository } from "@/repositories/message.repository";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { unauthorized } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const token = await getSessionCookie();
    if (!token) throw unauthorized();
//auth check

    const session = await verifyAccessToken(token);
    const userId = session.sub;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;
    const includeArchived = searchParams.get("archived") !== "false";

    const data = await messageRepository.findByReceiver(userId, {
      cursor,
      includeArchived,
    });

    const total = await messageRepository.countTotal(userId);
    const unreadCount = await messageRepository.countUnread(userId);

    return successResponse({
      messages: data.items,
      nextCursor: data.nextCursor,
      hasNextPage: data.hasNextPage,
      total,
      unreadCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
