"use client";

import { useState } from "react";
import { Trash2, Clock, Smile, Frown, MessageSquare, Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteMessage } from "@/features/messages/hooks/use-delete-message";
import { useToggleRead } from "@/features/messages/hooks/use-toggle-read";
import type { Message } from "@/features/messages/types/message.types";

function SentimentBadge({ sentiment, score }: { sentiment: Message["sentiment"]; score: Message["sentimentScore"] }) {
  if (!sentiment) return null;

  const config = {
    POSITIVE: { icon: Smile, label: "Positive", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    NEGATIVE: { icon: Frown, label: "Negative", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    NEUTRAL: { icon: MessageSquare, label: "Neutral", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  }[sentiment];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <Badge variant="outline" className={cn("gap-1 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {score !== null && score !== undefined && (
        <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground border-border/40 bg-muted/5">
          Confidence: {Math.round(score * 100)}%
        </Badge>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface MessageCardProps {
  message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useDeleteMessage();
  const toggleReadMutation = useToggleRead();

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMutation.mutate(message.id);
  }

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-all duration-200",
        "hover:border-border hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
        !message.isRead && "border-l-4 border-l-primary"
      )}
    >
      {/* Unread indicator */}
      {!message.isRead && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
      )}

      {/* Sentiment Badge */}
      <SentimentBadge sentiment={message.sentiment} score={message.sentimentScore} />

      {/* Message content */}
      <p className="mb-4 text-sm leading-relaxed text-foreground/90">
        {message.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeAgo(message.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              toggleReadMutation.mutate({
                id: message.id,
                isRead: !message.isRead,
              })
            }
            disabled={toggleReadMutation.isPending}
          >
            {message.isRead ? (
              <>
                <Mail className="h-3.5 w-3.5" />
                <span>Mark as unread</span>
              </>
            ) : (
              <>
                <MailOpen className="h-3.5 w-3.5" />
                <span>Mark as read</span>
              </>
            )}
          </Button>

          <Button
            variant={confirmDelete ? "destructive" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleDelete}
            onMouseLeave={() => setConfirmDelete(false)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmDelete ? "Confirm" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
