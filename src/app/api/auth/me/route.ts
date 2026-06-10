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

    const user =
      await verifyAccessToken(token);

    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}