import { NextRequest } from "next/server";
import { SendMessageSchema } from "@/schemas/message.schema";
import { messageService } from "@/services/message.service";
import { successResponse, errorResponse } from "@/lib/route-handler";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyTokenSafe } from "@/lib/auth/jwt";
import { badRequest } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SendMessageSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(
        badRequest(validated.error.issues[0]?.message || "Invalid request data")
      );
    }

    // Optional: Get sender info if they are logged in
    // This allows us to prevent users from sending messages to themselves
    // and potentially other features like rate limiting per user.
    const token = await getSessionCookie();
    const session = token ? await verifyTokenSafe(token) : null;
    const senderId = session?.sub;

    await messageService.sendMessage(validated.data, senderId);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
