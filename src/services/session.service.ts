import crypto from "crypto";
import { redis } from "@/lib/redis";


const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days


export type SessionData={
    userId:string,
    email:string,
    createdAt: string;
}

function getSessionKey(token:string){
    return `session:${token}`;
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export const sessionService={
    async createSession(data:omit<SessionData>,"createdAt"){
        const token =createSessionToken();
        const sessionData:SessionData={
            ...data,
            createdAt:new Date().toISOString(),
        };

        await redis.set(getSessionKey(token),
    JSON.stringify(sessionData),"EX",SESSION_TTL_SECONDS) ;
    
    return {
        token,
        session:sessionData,
        expiresInSeconds: SESSION_TTL_SECONDS,
    }
    },

    async getSession(token:string){
      const sessionKey=getSessionKey(token);
      const sessionJson=await redis.get(sessionKey);
      if(!sessionJson){
        return null;
      }
      return JSON.parse(sessionJson) as SessionData;
    },

    async deleteSession(token:string){
      const sessionKey=getSessionKey(token);
      await redis.del(sessionKey);
    },

    async refreshSession(token:string){
        const key=getSessionKey(token);

        const exist=await redis.exists(key);

        if(!exist){
            return false;
        }

        await redis.expire(key,SESSION_TTL_SECONDS);
        
        return true;
        
    }
}

