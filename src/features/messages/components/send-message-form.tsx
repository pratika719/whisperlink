"use client";

import { useState } from "react";
import { Send, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { useSendMessage } from "@/features/messages/hooks/use-send-message";

const MAX_CHARS = 500;

interface SendMessageFormProps {
  username: string;
}

export function SendMessageForm({ username }: SendMessageFormProps) {
  const [content, setContent] = useState("");
  const sendMutation = useSendMessage();
  const charCount = content.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || charCount > MAX_CHARS) return;

    sendMutation.mutate(
      { username, content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  }

  if (sendMutation.isSuccess && !content) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageSquarePlus className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Message sent!</p>
          <p className="text-sm text-muted-foreground">
            Your anonymous message has been delivered.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => sendMutation.reset()}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your anonymous message..."
          rows={5}
          maxLength={MAX_CHARS + 50} // Allow typing over to show warning
          className="w-full resize-none rounded-xl border border-border/60 bg-card/60 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-sm transition-colors"
          disabled={sendMutation.isPending}
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              charCount > MAX_CHARS
                ? "text-destructive font-medium"
                : charCount > MAX_CHARS * 0.9
                  ? "text-yellow-500"
                  : "text-muted-foreground"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full gap-2"
        disabled={
          sendMutation.isPending || !content.trim() || charCount > MAX_CHARS
        }
      >
        {sendMutation.isPending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
        Send anonymously
      </Button>
    </form>
  );
}
