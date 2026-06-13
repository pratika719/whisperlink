import { prisma } from "@/lib/prisma/prisma";

export const aiUsageLogRepository = {
  async create(userId: string, feature: string) {
    return prisma.aIUsageLog.create({
      data: {
        userId,
        feature,
      },
    });
  },
};
