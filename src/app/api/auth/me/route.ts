// src/app/api/auth/me/route.ts

import {
  clearSessionCookie,
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
import { unauthorized } from "@/lib/errors";

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

    let decoded 
try {
  
      decoded= await verifyAccessToken(token);
} catch {
   await clearSessionCookie();
  throw unauthorized("session expired or invalid");
}

    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      throw unauthorized("User not found or session invalid");
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