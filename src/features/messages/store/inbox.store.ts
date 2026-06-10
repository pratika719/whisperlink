import { create } from "zustand";

export type InboxFilter = "all" | "unread" | "archived";

interface InboxState {
  filter: InboxFilter;
  selectedMessageId: string | null;

  setFilter: (filter: InboxFilter) => void;
  selectMessage: (id: string | null) => void;
}

export const useInboxStore = create<InboxState>()((set) => ({
  filter: "all",
  selectedMessageId: null,

  setFilter: (filter) => set({ filter, selectedMessageId: null }),
  selectMessage: (id) => set({ selectedMessageId: id }),
}));
