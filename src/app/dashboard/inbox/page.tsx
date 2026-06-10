"use client";

import { Inbox } from "lucide-react";

import { useInbox } from "@/features/messages/hooks/use-inbox";
import { useInboxStore } from "@/features/messages/store/inbox.store";
import { MessageCard } from "@/features/messages/components/message-card";
import { InboxFilters } from "@/features/messages/components/inbox-filters";
import { InboxSkeleton } from "@/features/messages/components/inbox-skeleton";
import { EmptyInbox } from "@/features/messages/components/empty-inbox";

export default function InboxPage() {
  const { data, isLoading, isError } = useInbox();
  const filter = useInboxStore((s) => s.filter);

  const filteredMessages = data?.messages ? (() => {
    switch (filter) {
      case "unread":
        return data.messages.filter((m) => !m.isRead);
      case "archived":
        return data.messages.filter((m) => m.isArchived);
      default:
        return data.messages.filter((m) => !m.isArchived);
    }
  })() : [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
            {data && (
              <p className="text-sm text-muted-foreground">
                {data.unreadCount} unread · {data.total} total
              </p>
            )}
          </div>
        </div>
        <InboxFilters />
      </div>

      {/* Content */}
      {isLoading ? (
        <InboxSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load messages. Please try refreshing.
        </div>
      ) : filteredMessages.length === 0 ? (
        filter === "all" && (!data?.messages || data.messages.length === 0) ? (
          <EmptyInbox />
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No {filter} messages.
          </div>
        )
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
