"use client";

import { Inbox, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-auth-store";

export function EmptyInbox() {
  const user = useCurrentUser();
  const [copied, setCopied] = useState(false);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${user?.username ?? ""}`
    : "";

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <Inbox className="h-10 w-10 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No messages yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Share your link to start receiving anonymous messages from anyone.
        </p>
      </div>

      {user && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={copyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy your link"}
        </Button>
      )}
    </div>
  );
}
