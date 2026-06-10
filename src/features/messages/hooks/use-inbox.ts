"use client";

import { useQuery } from "@tanstack/react-query";
import { messagesClient } from "@/features/messages/api/messages.client";

export const inboxKeys = {
  all: ["messages", "inbox"] as const,
};

export function useInbox() {
  return useQuery({
    queryKey: inboxKeys.all,
    queryFn: async () => {
      const res = await messagesClient.getInbox();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}
