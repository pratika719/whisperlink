// src/app/api/auth/register/route.ts

import { NextRequest } from "next/server";

import { RegisterSchema } from "@/schemas/auth.schema";

import { authService } from "@/services/auth.service";

import {
  errorResponse,
  successResponse,
  withLogging,
} from "@/lib/route-handler";

export const POST = withLogging(async function (
  req: NextRequest
) {
  try {
    const body = await req.json();

    const result =
      RegisterSchema.safeParse(body);

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
      await authService.register(
        result.data
      );

    return successResponse(
      data,
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});