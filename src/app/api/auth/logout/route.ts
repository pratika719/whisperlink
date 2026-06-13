// src/app/api/auth/logout/route.ts

import {
  clearSessionCookie,
} from "@/lib/auth/cookies";

import {
  successResponse,
  errorResponse,
} from "@/lib/route-handler";

export async function POST() {
  try {
    await clearSessionCookie();

    return successResponse({
      success: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

//clear seesion cookie
