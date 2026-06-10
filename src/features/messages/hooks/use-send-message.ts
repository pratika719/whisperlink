"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { messagesClient } from "@/features/messages/api/messages.client";
import type { SendMessageInput } from "@/features/messages/types/message.types";

export function useSendMessage() {
  return useMutation({
    mutationFn: (data: SendMessageInput) => messagesClient.sendMessage(data),
    onSuccess: () => {
      toast.success("Message sent anonymously!");
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });
}
