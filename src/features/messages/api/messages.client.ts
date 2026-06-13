import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type {
  InboxResponse,
  SendMessageInput,
} from "@/features/messages/types/message.types";

export const messagesClient = {
  getInbox() {
    return api.get<ApiResponse<InboxResponse>>("/messages/inbox");
  },

  deleteMessage(id: string) {
    return api.post<ApiResponse<{ success: boolean }>>("/messages/delete", {
      messageId: id,
    });
  },

  archiveMessage(id: string) {
    return api.post<ApiResponse<{ success: boolean }>>("/messages/archive", {
      messageId: id,
    });
  },

  toggleRead(id: string, isRead: boolean) {
    return api.post<ApiResponse<{ success: boolean }>>("/messages/toggle-read", {
      messageId: id,
      isRead,
    });
  },

  markAllAsRead() {
    return api.post<ApiResponse<{ success: boolean }>>("/messages/mark-all-read");
  },

  sendMessage(data: SendMessageInput) {
    return api.post<ApiResponse<{ success: boolean }>>("/messages/send", data);
  },

  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>("/messages/unread-count");
  },
};
