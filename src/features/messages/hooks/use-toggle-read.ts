"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messagesClient } from "@/features/messages/api/messages.client";
import { inboxKeys } from "./use-inbox";
import type { InboxResponse } from "@/features/messages/types/message.types";

interface ToggleReadParams {
  id: string;
  isRead: boolean;
}

export function useToggleRead() {
  const queryClient = useQueryClient();
  const unreadCountKey = ["messages", "unread-count"];

  return useMutation({
    mutationFn: ({ id, isRead }: ToggleReadParams) =>
      messagesClient.toggleRead(id, isRead),

    // ── Optimistic update ───────────────────────────────────────────
    onMutate: async ({ id, isRead }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: inboxKeys.all });
      await queryClient.cancelQueries({ queryKey: unreadCountKey });

      // Snapshot the previous values
      const previousInbox = queryClient.getQueryData<InboxResponse>(inboxKeys.all);
      const previousUnreadCount = queryClient.getQueryData<number>(unreadCountKey);

      // Optimistically update inbox
      if (previousInbox) {
        const targetMessage = previousInbox.messages.find((m) => m.id === id);
        const wasRead = targetMessage?.isRead ?? false;

        // Only update counts if the status actually changes
        let newUnreadCount = previousInbox.unreadCount;
        if (wasRead !== isRead) {
          newUnreadCount = isRead
            ? Math.max(0, previousInbox.unreadCount - 1)
            : previousInbox.unreadCount + 1;
        }

        queryClient.setQueryData<InboxResponse>(inboxKeys.all, {
          ...previousInbox,
          unreadCount: newUnreadCount,
          messages: previousInbox.messages.map((m) =>
            m.id === id ? { ...m, isRead } : m
          ),
        });
      }

      // Optimistically update unread count
      if (previousUnreadCount !== undefined) {
        if (previousInbox) {
          const targetMessage = previousInbox.messages.find((m) => m.id === id);
          const wasRead = targetMessage?.isRead ?? false;
          if (wasRead !== isRead) {
            queryClient.setQueryData<number>(
              unreadCountKey,
              isRead ? Math.max(0, previousUnreadCount - 1) : previousUnreadCount + 1
            );
          }
        }
      }

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
      toast.error("Failed to update message status.");
    },

    // Always refetch after mutation to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    },

    onSuccess: (_res, { isRead }) => {
      toast.success(isRead ? "Message marked as read." : "Message marked as unread.");
    },
  });
}
