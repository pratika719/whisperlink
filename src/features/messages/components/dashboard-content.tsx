"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Link2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-auth-store";
import { useUnreadCount } from "@/features/messages/hooks/use-unread-count";
import { useInbox } from "@/features/messages/hooks/use-inbox";
import { useToggleMessages } from "@/features/messages/hooks/use-toggle-messages";
import { MessageCard } from "@/features/messages/components/message-card";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
  const user = useCurrentUser();
  const { data: unreadCount } = useUnreadCount();
  const { data: inbox } = useInbox();
  const toggleMutation = useToggleMessages();
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${user?.username ?? ""}`
      : "";

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const recentMessages = inbox?.messages.slice(0, 3) ?? [];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm font-medium text-primary">Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username ?? "..."}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={MessageSquare}
          label="Total messages"
          value={inbox?.total ?? 0}
        />
        <StatCard
          icon={Mail}
          label="Unread"
          value={unreadCount ?? 0}
        />
        <StatCard
          icon={user?.acceptMessages ? ToggleRight : ToggleLeft}
          label="Accepting messages"
          value={user?.acceptMessages ? "On" : "Off"}
        />
      </div>

      {/* Your link */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your link</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Share this link so anyone can send you anonymous messages.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 truncate rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 font-mono text-sm">
            {profileUrl || "Loading..."}
          </div>
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={copyLink}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <p className="text-sm text-muted-foreground">Accept messages</p>
          <button
            type="button"
            role="switch"
            aria-checked={user?.acceptMessages ?? true}
            onClick={() => toggleMutation.mutate(!user?.acceptMessages)}
            disabled={toggleMutation.isPending}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              user?.acceptMessages ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                user?.acceptMessages ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Recent messages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent messages</h2>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/dashboard/inbox">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
            No messages yet. Share your link to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
