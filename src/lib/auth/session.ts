import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";


export interface SessionPayload extends JWTPayload {
    sub: string;
    email: string;
    username: string;
}


const secret = new TextEncoder().encode(env.AUTH_SECRET);

const SESSION_DURATION= 60*60*24*7 //1 week

export async function createSessionToken(
    payload:SessionPayload

):Promise<string>{
  return await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(
      `${SESSION_DURATION}s`
    )
    .sign(secret);

}

export async function verifySessionToken(token:string):Promise<SessionPayload>{
    const {payload}=await jwtVerify(token,secret);

     return {
    sub: payload.sub as string,
    email: payload.email as string,
    username: payload.username as string,
  };
}

export async function getsessionPayload(
    token?:string
):Promise<SessionPayload|null>{
    if(!token){
        return null;
    }


    try{
        return await verifySessionToken(token);

    }catch{
        return null;
    }
}

