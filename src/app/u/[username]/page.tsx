import { Metadata } from "next";
import { MessageSquare, XCircle } from "lucide-react";

import { prisma } from "@/lib/prisma/prisma";
import { SendMessageForm } from "@/features/messages/components/send-message-form";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Send a message to @${username}`,
    description: `Send an anonymous message to ${username} on WhisperLink.`,
  };
}

export default async function PublicProfilePage({
  params,
}: PageProps) {
  const { username } = await params;

  // Look up the user by username
  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, acceptMessages: true },
  });

  // User not found
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p className="text-muted-foreground">
              The user <span className="font-mono">@{username}</span> doesn&apos;t
              exist. Check the link and try again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // User not accepting messages
  if (!user.acceptMessages) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Not accepting messages</h1>
            <p className="text-muted-foreground">
              <span className="font-mono">@{user.username}</span> has turned off
              anonymous messages for now.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // User is accepting messages — show the form
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            Send a message to{" "}
            <span className="text-gradient">@{user.username}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your message will be completely anonymous.
          </p>
        </div>

        <SendMessageForm username={user.username} />
      </div>
    </main>
  );
}
