"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Inbox,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/features/messages/hooks/use-unread-count";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inbox",
    href: "/dashboard/inbox",
    icon: Inbox,
    showBadge: true,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: unreadCount } = useUnreadCount();

  return (
    <aside className="hidden w-64 border-r border-border/50 bg-card/40 backdrop-blur xl:flex xl:flex-col">
      <div className="border-b border-border/50 p-6">
        <h2 className="text-gradient text-xl font-bold">
          WhisperLink
        </h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}

                  {/* Unread badge */}
                  {item.showBadge && unreadCount && unreadCount > 0 ? (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}