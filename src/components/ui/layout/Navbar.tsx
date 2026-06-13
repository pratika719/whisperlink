"use client";

import Link from "next/link";
import { Settings, LogOut, Menu, Inbox, LayoutDashboard } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/api/auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface NavbarProps {
  user: {
    username: string;
    email: string;
    image?: string | null;
  };
}

export function Navbar({
  user,
}: NavbarProps) {
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await authClient.logout();
      logout();
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="font-bold text-xl text-gradient"
        >
          WhisperLink
        </Link>

        <div className="flex items-center gap-4">
          {/* Mobile Navigation Hamburger Menu */}
          <div className="xl:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl outline-none hover:bg-accent">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer w-full">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/inbox" className="flex items-center gap-2 cursor-pointer w-full">
                    <Inbox className="h-4 w-4" />
                    Inbox
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer w-full">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.image ?? ""} />
                  <AvatarFallback>
                    {user.username
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <div className="px-3 py-2">
                <p className="font-medium">
                  {user.username}
                </p>

                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
