export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore?: number | null;
  createdAt: string;
}

export interface InboxResponse {
  messages: Message[];
  total: number;
  unreadCount: number;
}

export interface SendMessageInput {
  username: string;
  content: string;
}
