import { SignJWT } from "jose";
import { env } from "@/lib/env";
import { sessionService } from "@/services/session.service";

const secret = new TextEncoder().encode(env.AUTH_SECRET);

export interface jwtPayload {
    sub: string;
    email: string;
    username: string;
    createdAt: string;
}

// Deprecated: generateAccessToken is kept for backwards compatibility
// export async function generateAccessToken(
//     payload: jwtPayload
// ): Promise<string> {
//     return await new SignJWT({
//         email: payload.email,
//         username: payload.username,
//     })
//     .setProtectedHeader({ alg: "HS256" })
//     .setSubject(payload.sub)
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);
// }

export async function verifyAccessToken(
  token: string
): Promise<jwtPayload> {
  const session = await sessionService.getSession(token);

  if (!session) {
    throw new Error("Session expired or invalid");
  }

  // Sliding window expiration: extend the session TTL on access
  await sessionService.refreshSession(token);

  return {
    sub: session.userId,
    email: session.email,
    username: session.username,
    createdAt:session.createdAt,
  };
}

export async function verifyTokenSafe(
  token: string
): Promise<jwtPayload | null> {
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
