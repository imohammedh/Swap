"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import dynamic from "next/dynamic";
import {
  Bell,
  Book,
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  Ticket,
  Upload,
  User,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import MaxWidth from "@/components/max-width";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ThemeToggle = dynamic(() => import("@/components/theme-toggle"), {
  ssr: false,
});

const mobileMenuItems = [
  { href: "/account/offers", label: "Offers", icon: Ticket },
  { href: "/account/messages", label: "Messages", icon: Bell },
  { href: "/account/my-listings", label: "My Listings", icon: ShoppingBag },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/blog", label: "Blog", icon: Book },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

function initials(name: string | null | undefined) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type AppHeaderProps = {
  onCreateListing: () => void;
};

export default function AppHeader({ onCreateListing }: AppHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  const [searchTerm, setSearchTerm] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifPanelRef = useRef<HTMLDivElement | null>(null);
  const notifBellDesktopRef = useRef<HTMLButtonElement | null>(null);
  const notifBellMobileRef = useRef<HTMLButtonElement | null>(null);

  const me = useQuery(api.users.me);
  const notifications = useQuery(
    api.notifications.listMine,
    isAuthenticated ? undefined : "skip",
  );
  const markAllRead = useMutation(api.notifications.markAllRead);

  const visibleNotifications =
    notifications?.filter((n) => (unreadOnly ? !n.read : true)) ?? [];

  const getNotificationHref = (
    item: NonNullable<typeof notifications>[number],
  ) => {
    if (item?.type === "message" && item?.conversationId) {
      return `/account/messages?id=${item.conversationId}`;
    }
    if (item?.type === "offer_pending") return "/account/offers";
    if (item?.type === "liked" || item?.type === "disliked") {
      return "/account/my-listings";
    }
    return null;
  };

  const handleNotificationClick = (
    item: NonNullable<typeof notifications>[number],
  ) => {
    const href = getNotificationHref(item);
    if (!href) return;
    setNotifOpen(false);
    router.push(href);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    router.push(`/search?${params.toString()}`);
  };

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notifPanelRef.current?.contains(target) ||
        notifBellDesktopRef.current?.contains(target) ||
        notifBellMobileRef.current?.contains(target)
      )
        return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MaxWidth className="flex flex-wrap items-center gap-3 p-3 md:p-4">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-primary"
        >
          SWAPP
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="relative min-w-[220px] flex-1"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search products, locations, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 pl-10"
          />
        </form>

        {/* Desktop: create listing */}
        <Button
          onClick={onCreateListing}
          className="hidden h-11 rounded-full px-5 md:inline-flex"
        >
          <Upload size={16} /> Create listing
        </Button>

        {/* Desktop: theme toggle */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Desktop: account / sign in */}
        {isAuthenticated ? (
          <Button
            variant="outline"
            className="hidden h-11 rounded-full md:inline-flex"
            onClick={() => router.push("/account")}
          >
            <User size={16} /> Account
          </Button>
        ) : (
          <Button
            variant="outline"
            className="hidden h-11 rounded-full md:inline-flex"
            onClick={() => router.push("/signin")}
          >
            <User size={16} /> Sign in
          </Button>
        )}

        {/* Desktop: notifications bell */}
        <Button
          ref={notifBellDesktopRef}
          variant="ghost"
          size="icon"
          className="relative hidden h-10 w-10 rounded-full md:inline-flex"
          onClick={() => {
            setDropdownOpen(false);
            setNotifOpen((v) => !v);
          }}
        >
          <Bell size={18} />
          {(notifications?.filter((n) => !n.read).length ?? 0) > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>

        {/* Mobile: notifications bell */}
        <Button
          ref={notifBellMobileRef}
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full md:hidden"
          onClick={() => {
            setDropdownOpen(false);
            setNotifOpen((v) => !v);
          }}
        >
          <Bell size={18} />
          {(notifications?.filter((n) => !n.read).length ?? 0) > 0 && (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>

        {/* Mobile hamburger dropdown */}
        <DropdownMenu
          open={dropdownOpen}
          onOpenChange={(open) => {
            setDropdownOpen(open);
            if (open) setNotifOpen(false);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full md:hidden"
            >
              <Menu size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-72 rounded-xl bg-card p-2"
          >
            {/* Profile header */}
            <DropdownMenuLabel className="rounded-lg bg-muted/40 p-3 mb-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src={me?.image ?? undefined}
                    alt={me?.name ?? "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials(me?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {me?.name ?? "Your account"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    0.0 · 0 Ratings
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.push("/account")}>
              <User size={16} /> Manage Account
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onCreateListing}>
              <Upload size={16} /> Create listing
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {mobileMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                >
                  <Icon size={16} /> {item.label}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            {isAuthenticated ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  void signOut().then(() => router.push("/signin"));
                }}
              >
                <LogOut size={16} /> Sign out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => router.push("/signin")}>
                <User size={16} /> Sign in
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification panel */}
        {notifOpen && (
          <div
            ref={notifPanelRef}
            className="absolute right-3 top-[72px] z-20 w-[320px] rounded-xl border bg-card p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xl font-semibold">Notifications</p>
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                Unread only
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="accent-primary"
                />
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-3 w-full"
              onClick={() => void markAllRead({})}
              disabled={!isAuthenticated}
            >
              Mark all as read
            </Button>
            <div className="max-h-56 space-y-2 overflow-auto">
              {visibleNotifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No New Updates
                </p>
              ) : (
                visibleNotifications.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full rounded-md border p-2 text-left text-sm hover:bg-muted/40 ${item.read ? "bg-muted/20" : "bg-primary/10"}`}
                  >
                    {item.text}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </MaxWidth>
    </header>
  );
}
