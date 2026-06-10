
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";


const secret=new TextEncoder().encode(
    env.AUTH_SECRET
);

export interface jwtPayload{
    sub:string;
    email:string;
    username:string;
}

export async function generateAccessToken(
payload:jwtPayload):Promise<string>{
    return await new SignJWT({
        email:payload.email,
        username:payload.username,
    })
    .setProtectedHeader({
        alg:"HS256"
    })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<jwtPayload> {
  const { payload } = await jwtVerify(
    token,
    secret
  );

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    username: payload.username as string,
  };
}
export async function verifyTokenSafe(
  token: string
) {
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}