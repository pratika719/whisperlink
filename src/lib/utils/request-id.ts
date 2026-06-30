import crypto from "crypto";

export function createRequestId() {
  return crypto.randomUUID();
}