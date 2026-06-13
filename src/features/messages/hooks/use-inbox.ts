"use client";

import { useQuery } from "@tanstack/react-query";
import { messagesClient } from "@/features/messages/api/messages.client";

export const inboxKeys = {
  all: ["messages", "inbox"] as const,
  filtered: (filter: string) => [...inboxKeys.all, filter] as const,
};

export function useInbox(filter: "all" | "unread" | "archived" = "all") {
  return useQuery({
    queryKey: inboxKeys.filtered(filter),
    queryFn: async () => {
      const res = await messagesClient.getInbox(filter);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}
