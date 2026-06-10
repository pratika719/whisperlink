// src/app/api/auth/verify-email/route.ts

import { NextRequest } from "next/server";

import { VerifyOtpSchema } from "@/schemas/auth.schema";

import { authService } from "@/services/auth.service";

import {
  errorResponse,
  successResponse,
} from "@/lib/route-handler";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const result =
      VerifyOtpSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          errors:
            result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const data =
      await authService.verifyEmail(
        result.data
      );

    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}