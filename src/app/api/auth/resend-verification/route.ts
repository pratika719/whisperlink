// src/app/api/auth/resend-verification/route.ts

import { NextRequest } from "next/server";

import { ForgotPasswordSchema } from "@/schemas/auth.schema";

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
      ForgotPasswordSchema.safeParse(body);

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
      await authService.resendVerificationEmail(
        result.data.email
      );

    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
