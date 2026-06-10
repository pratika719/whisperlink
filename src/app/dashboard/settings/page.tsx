"use client";

import { Settings, MessageCircle } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/use-auth-store";
import { useToggleMessages } from "@/features/messages/hooks/use-toggle-messages";

export default function SettingsPage() {
  const user = useCurrentUser();
  const toggleMutation = useToggleMessages();

  const acceptMessages = user?.acceptMessages ?? true;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Username
            </label>
            <p className="mt-1 font-medium">{user?.username ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <p className="mt-1 font-medium">{user?.email ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Message Preferences */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-4">
        <h2 className="text-lg font-semibold">Message Preferences</h2>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Accept anonymous messages</p>
              <p className="text-sm text-muted-foreground">
                When turned off, no one can send you new messages.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={acceptMessages}
            onClick={() => toggleMutation.mutate(!acceptMessages)}
            disabled={toggleMutation.isPending}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              acceptMessages ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                acceptMessages ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
