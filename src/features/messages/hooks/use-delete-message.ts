"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { messagesClient } from "@/features/messages/api/messages.client";
import { inboxKeys } from "./use-inbox";
import type { InboxResponse } from "@/features/messages/types/message.types";

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagesClient.deleteMessage(id),

    // ── Optimistic update ───────────────────────────────────────────
    onMutate: async (id) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: inboxKeys.all });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<InboxResponse>(inboxKeys.all);

      // Optimistically remove the message from the cache
      if (previous) {
        const deleted = previous.messages.find((m) => m.id === id);
        queryClient.setQueryData<InboxResponse>(inboxKeys.all, {
          ...previous,
          messages: previous.messages.filter((m) => m.id !== id),
          total: previous.total - 1,
          unreadCount:
            deleted && !deleted.isRead
              ? previous.unreadCount - 1
              : previous.unreadCount,
        });
      }

      return { previous };
    },

    // Rollback on error
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(inboxKeys.all, context.previous);
      }
      toast.error("Failed to delete message. Please try again.");
    },

    // Always refetch after mutation to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: inboxKeys.all });
    },

    onSuccess: () => {
      toast.success("Message deleted.");
    },
  });
}
