import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { userRepository } from "@/repositories/user.repository";
import { errorResponse, successResponse } from "@/lib/route-handler";
import { unauthorized } from "@/lib/errors";

const AcceptMessagesSchema = z.object({
  acceptMessages: z.boolean({
    message: "acceptMessages must be a boolean",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionCookie();

    if (!token) {
      throw unauthorized("Unauthorized");
    }

    let decoded;
    try {
      decoded = await verifyAccessToken(token);
    } catch {
      throw unauthorized("Session expired or invalid");
    }

    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      throw unauthorized("User not found or session invalid");
    }

    const body = await req.json();
    const result = AcceptMessagesSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await userRepository.updateAcceptMessages(
      decoded.sub,
      result.data.acceptMessages
    );

    return successResponse({
      acceptMessages: updatedUser.acceptMessages,
    });
  } catch (error) {
    console.error("Error updating accept messages status:", error);
    return errorResponse(error);
  }
}