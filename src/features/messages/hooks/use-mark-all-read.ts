"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messagesClient } from "@/features/messages/api/messages.client";
import { inboxKeys } from "./use-inbox";
import type { InboxResponse } from "@/features/messages/types/message.types";

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const unreadCountKey = ["messages", "unread-count"];

  return useMutation({
    mutationFn: () => messagesClient.markAllAsRead(),

    // ── Optimistic update ───────────────────────────────────────────
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: inboxKeys.all });
      await queryClient.cancelQueries({ queryKey: unreadCountKey });

      // Snapshot the previous values
      const previousInbox = queryClient.getQueryData<InboxResponse>(inboxKeys.all);
      const previousUnreadCount = queryClient.getQueryData<number>(unreadCountKey);

      // Optimistically update inbox
      if (previousInbox) {
        queryClient.setQueryData<InboxResponse>(inboxKeys.all, {
          ...previousInbox,
          unreadCount: 0,
          messages: previousInbox.messages.map((m) => ({
            ...m,
            isRead: true,
          })),
        });
      }

      // Optimistically update unread count
      queryClient.setQueryData<number>(unreadCountKey, 0);

      return { previousInbox, previousUnreadCount };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousInbox) {
        queryClient.setQueryData(inboxKeys.all, context.previousInbox);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(unreadCountKey, context.previousUnreadCount);
      }
      toast.error("Failed to mark all messages as read.");
    },

    // Always refetch after mutation to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    },

    onSuccess: () => {
      toast.success("All messages marked as read.");
    },
  });
}
