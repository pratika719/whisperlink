import { ApiError } from "./api-error";

export const notFound = (message = "Not found") =>
  new ApiError(404, message);

export const badRequest = (message = "Bad request") =>
  new ApiError(400, message);

export const unauthorized = (message = "Unauthorized") =>
  new ApiError(401, message);

export const forbidden = (message = "Forbidden") =>
  new ApiError(403, message);

export const conflict = (message = "Conflict") =>
  new ApiError(409, message);

export const internalError = (message = "Internal server error") =>
  new ApiError(500, message);
