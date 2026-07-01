// src/app/api/auth/logout/route.ts

import {
  clearSessionCookie,getSessionCookie
} from "@/lib/auth/cookies";

import {
  successResponse,
  errorResponse,
} from "@/lib/route-handler";

import {sessionService} from "@/services/session.service"

export async function POST() {
  try {
     const token = await getSessionCookie();

  if (token) {
    await sessionService.deleteSession(token);
  }

    await clearSessionCookie();

    return successResponse({
      success: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

//clear seesion cookie
