// src/lib/auth/cookies.ts

import { cookies } from "next/headers";

const SESSION_COOKIE = "whisperlink_session";

export async function setSessionCookie(
  token: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        60 *
        60 *
        24 *
        7, // 7 days
    }
  );
}

export async function getSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(
    SESSION_COOKIE
  )?.value;
}
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Immediately expires the cookie
  });
}
