"use client";

import { cn } from "@/lib/utils";
import {
  useInboxStore,
  type InboxFilter,
} from "@/features/messages/store/inbox.store";

const filters: { label: string; value: InboxFilter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Archived", value: "archived" },
];

export function InboxFilters() {
  const activeFilter = useInboxStore((s) => s.filter);
  const setFilter = useInboxStore((s) => s.setFilter);

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
            activeFilter === f.value
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
