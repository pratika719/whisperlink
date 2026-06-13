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

    let session;
    try {
      session = await verifyAccessToken(token);
    } catch {
      throw unauthorized("Session expired or invalid");
    }
    const userId = session.sub;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;
    const filter = (searchParams.get("filter") || "all") as "all" | "unread" | "archived";

    const data = await messageRepository.findByReceiver(userId, {
      cursor,
      filter,
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
