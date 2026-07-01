"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.withLogging = withLogging;
const server_1 = require("next/server");
const api_error_1 = require("../lib/api-error");
const logger_1 = require("../lib/logger");
const request_id_1 = require("../lib/utils/request-id");
function successResponse(data, status = 200) {
    return server_1.NextResponse.json({
        success: true,
        data,
    }, { status });
}
function errorResponse(error) {
    if (error instanceof api_error_1.ApiError) {
        logger_1.logger.warn({
            event: "route_api_error",
            statusCode: error.statusCode,
            message: error.message,
        });
        return server_1.NextResponse.json({
            success: false,
            message: error.message,
        }, {
            status: error.statusCode,
        });
    }
    logger_1.logger.error({
        event: "route_unhandled_error",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
    });
    return server_1.NextResponse.json({
        success: false,
        message: "Internal Server Error",
    }, {
        status: 500,
    });
}
function withLogging(handler) {
    return async (req, ...args) => {
        const startTime = Date.now();
        const requestId = req.headers.get("x-request-id") || (0, request_id_1.createRequestId)();
        const url = new URL(req.url);
        logger_1.logger.info({
            event: "request_started",
            requestId,
            method: req.method,
            url: url.pathname + url.search,
        });
        try {
            const response = await handler(req, ...args);
            logger_1.logger.info({
                event: "request_completed",
                requestId,
                method: req.method,
                url: url.pathname + url.search,
                status: response.status,
                durationMs: Date.now() - startTime,
            });
            response.headers.set("x-request-id", requestId);
            return response;
        }
        catch (error) {
            logger_1.logger.error({
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
