// src/schemas/message.schema.ts

import { z } from "zod";

export const SendMessageSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30),

  content: z
    .string()
    .trim()
    .min(1)
    .max(500),
});

export type SendMessageInput =
  z.infer<typeof SendMessageSchema>;