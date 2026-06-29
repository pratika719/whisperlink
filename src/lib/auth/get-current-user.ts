import { prisma } from "@/lib/prisma/prisma";
import { getSessionCookie } from "@/lib/auth/cookies";
import { sessionService } from "@/services/session.service";

export async function getCurrentUser() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  const session = await sessionService.getSession(token);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (!user) {
    await sessionService.deleteSession(token);
    return null;
  }

  return user;
}