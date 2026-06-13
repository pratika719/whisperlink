// src/app/api/auth/me/route.ts

import {
  getSessionCookie,
} from "@/lib/auth/cookies";

import {
  verifyAccessToken,
} from "@/lib/auth/jwt";

import {
  errorResponse,
  successResponse,
} from "@/lib/route-handler";
import { userRepository } from "@/repositories/user.repository";

export async function GET() {
  try {
    const token =
      await getSessionCookie();

    if (!token) {
      return Response.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }
console.log("token from me",token);
    const decoded =
      await verifyAccessToken(token);

    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return successResponse({
      id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      acceptMessages: user.acceptMessages,
    });
  } catch (error) {
    return errorResponse(error);
  }
}