import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { createRequestId } from "@/lib/utils/request-id";

export function successResponse(
  data: unknown,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(
  error: unknown
) {
  if (error instanceof ApiError) {
    logger.warn({
      event: "route_api_error",
      statusCode: error.statusCode,
      message: error.message,
    });
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  logger.error({
    event: "route_unhandled_error",
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    {
      status: 500,
    }
  );
}

export function withLogging(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const requestId = req.headers.get("x-request-id") || createRequestId();
    const url = new URL(req.url);

    logger.info({
      event: "request_started",
      requestId,
      method: req.method,
      url: url.pathname + url.search,
    });

    try {
      const response = await handler(req, ...args);

      logger.info({
        event: "request_completed",
        requestId,
        method: req.method,
        url: url.pathname + url.search,
        status: response.status,
        durationMs: Date.now() - startTime,
      });

      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      logger.error({
        event: "request_failed",
        requestId,
        method: req.method,
        url: url.pathname + url.search,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: Date.now() - startTime,
      });
      throw error;
    }
  };
}