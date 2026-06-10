"use client";

import { useQuery } from "@tanstack/react-query";
import { messagesClient } from "@/features/messages/api/messages.client";

export function useUnreadCount() {
  return useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: async () => {
      const res = await messagesClient.getUnreadCount();
      return res.data.data.count;
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Poll every 60 seconds
  });
}
