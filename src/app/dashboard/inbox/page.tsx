"use client";

import { Inbox, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInbox } from "@/features/messages/hooks/use-inbox";
import { useInboxStore } from "@/features/messages/store/inbox.store";
import { useMarkAllRead } from "@/features/messages/hooks/use-mark-all-read";
import { MessageCard } from "@/features/messages/components/message-card";
import { InboxFilters } from "@/features/messages/components/inbox-filters";
import { InboxSkeleton } from "@/features/messages/components/inbox-skeleton";
import { EmptyInbox } from "@/features/messages/components/empty-inbox";

export default function InboxPage() {
  const filter = useInboxStore((s) => s.filter);
  const { data, isLoading, isError } = useInbox(filter);
  const markAllReadMutation = useMarkAllRead();

  const filteredMessages = data?.messages || [];

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
        <div className="flex items-center gap-3">
          {data && data.unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs border-border/60 hover:bg-muted"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all as read</span>
            </Button>
          )}
          <InboxFilters />
        </div>
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
