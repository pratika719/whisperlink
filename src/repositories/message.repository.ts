import { prisma } from "@/lib/prisma/prisma";
import { Sentiment } from "@/generated/prisma/client";

const DEFAULT_PAGE_SIZE = 20;

export const messageRepository = {
  async create(receiverId: string, content: string, senderId?: string, sentiment?: Sentiment, sentimentScore?: number) {
    return prisma.message.create({
      data: {
        receiverId,
        content,
        senderId,
        sentiment,
        sentimentScore,
      },
      select: {
        id: true,
        content: true,
        sentiment: true,
        sentimentScore: true,
        createdAt: true,
      },
    });
  },

  async findById(id: string, receiverId: string) {
    return prisma.message.findFirst({
      where: {
        id,
        receiverId,
        isDeleted: false,
      },
    });
  },

  async findByReceiver(
    receiverId: string,
    options: {
      cursor?: string;
      includeArchived?: boolean;
      pageSize?: number;
    } = {}
  ) {
    const {
      cursor,
      includeArchived = false,
      pageSize = DEFAULT_PAGE_SIZE,
    } = options;

    const messages = await prisma.message.findMany({
      where: {
        receiverId,
        isDeleted: false,
        ...(includeArchived ? {} : { isArchived: false }),
      },

      orderBy: {
        createdAt: "desc",
      },

      take: pageSize + 1,

      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),

      select: {
        id: true,
        content: true,
        sentiment: true,
        sentimentScore: true,
        isRead: true,
        isArchived: true,
        createdAt: true,
      },
    });

    const hasNextPage = messages.length > pageSize;

    const items = hasNextPage
      ? messages.slice(0, pageSize)
      : messages;

    const nextCursor = hasNextPage
      ? items[items.length - 1]?.id
      : null;

    return {
      items,
      hasNextPage,
      nextCursor,
    };
  },

  async countUnread(receiverId: string) {
    return prisma.message.count({
      where: {
        receiverId,
        isRead: false,
        isDeleted: false,
        isArchived: false,
      },
    });
  },

  async countTotal(receiverId: string) {
    return prisma.message.count({
      where: {
        receiverId,
        isDeleted: false,
      },
    });
  },

  async markAsRead(
    id: string,
    receiverId: string
  ) {
    return prisma.message.updateMany({
      where: {
        id,
        receiverId,
        isDeleted: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  async updateReadStatus(
    id: string,
    receiverId: string,
    isRead: boolean
  ) {
    return prisma.message.updateMany({
      where: {
        id,
        receiverId,
        isDeleted: false,
      },
      data: {
        isRead,
      },
    });
  },

  async markAllAsRead(receiverId: string) {
    return prisma.message.updateMany({
      where: {
        receiverId,
        isRead: false,
        isDeleted: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  async toggleArchive(
    id: string,
    receiverId: string,
    archived: boolean
  ) {
    return prisma.message.updateMany({
      where: {
        id,
        receiverId,
        isDeleted: false,
      },
      data: {
        isArchived: archived,
      },
    });
  },

  async updateSentiment(
    id: string,
    sentiment: Sentiment,
    sentimentScore?: number
  ) {
    return prisma.message.update({
      where: {
        id,
      },
      data: {
        sentiment,
        sentimentScore,
      },
      select: {
        id: true,
        sentiment: true,
        sentimentScore: true,
      },
    });
  },

  async softDelete(
    id: string,
    receiverId: string
  ) {
    return prisma.message.updateMany({
      where: {
        id,
        receiverId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });
  },
};