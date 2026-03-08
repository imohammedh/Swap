"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Baby,
  Bell,
  Book,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Laptop,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PawPrint,
  Search,
  Settings,
  Shapes,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sun,
  Ticket,
  Upload,
  User,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import AppFooter from "@/components/app-footer";
import MaxWidth from "@/components/max-width";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categoryNameById, categoryOptions } from "@/lib/categories";
import HomePageBanner from "@/public/Swap-HomePageBanner.svg";

const ThemeToggle = dynamic(() => import("@/components/theme-toggle"), {
  ssr: false,
});

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

const categoryIcons = {
  all: Shapes,
  vehicles: Car,
  "real-estate": Building2,
  mobiles: Smartphone,
  electronics: Laptop,
  furniture: Sofa,
  fashion: Shirt,
  pets: PawPrint,
  kids: Baby,
} as const;

const mobileMenuItems = [
  { href: "/account/offers", label: "Offers", icon: Ticket },
  { href: "/account/messages", label: "Messages", icon: MessageSquare },
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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);
  const notifBellDesktopRef = useRef<HTMLButtonElement | null>(null);
  const notifBellMobileRef = useRef<HTMLButtonElement | null>(null);

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

  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") === "swap" ? "swap" : "browse";

  const listings =
    useQuery(api.listings.listPublic, {
      search: searchTerm || undefined,
      categoryId: activeCategory,
    }) ?? [];

  const me = useQuery(api.users.me, {});
  const notifications = useQuery(api.notifications.listMine, {});
  const markAllRead = useMutation(api.notifications.markAllRead);
  const swipe = useMutation(api.listings.swipe);

  const featured = listings.slice(0, 4);
  const swipeDeck = [...listings].sort((a, b) => {
    if (!me?.id) return 0;
    const aMine = a.ownerId === me.id ? 1 : 0;
    const bMine = b.ownerId === me.id ? 1 : 0;
    return aMine - bMine;
  });
  const swipeTarget = swipeDeck[swipeIndex % Math.max(swipeDeck.length, 1)];

  const visibleNotifications = useMemo(() => {
    const rows = notifications ?? [];
    return unreadOnly ? rows.filter((row) => !row.read) : rows;
  }, [notifications, unreadOnly]);

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      setAuthPrompt("Sign in to create a listing.");
      return;
    }
    router.push("/onboarding/listing");
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (activeCategory !== "all") params.set("category", activeCategory);
    router.push(`/search?${params.toString()}`);
  };

  const handleSwipe = async (direction: "like" | "dislike") => {
    if (!swipeTarget) return;

    if (!isAuthenticated) {
      setAuthPrompt(
        direction === "like"
          ? "Sign in to like a product."
          : "Sign in to dislike a product.",
      );
      return;
    }

    try {
      await swipe({ listingId: swipeTarget._id, direction });
      setSwipeIndex((value) => value + 1);
      setAuthPrompt(null);
    } catch (error) {
      setAuthPrompt(
        error instanceof Error ? error.message : "Failed to swipe.",
      );
    }
  };

  const handleViewChange = (view: "swap" | "browse") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleCardSwipeEnd = async () => {
    const delta = dragX;
    setDragStartX(null);
    setIsSwiping(false);
    setDragX(0);

    if (delta > 110) {
      await handleSwipe("like");
      return;
    }
    if (delta < -110) {
      await handleSwipe("dislike");
    }
  };

  const scrollCategories = (direction: "left" | "right") => {
    const node = categoryScrollerRef.current;
    if (!node) return;
    const amount = Math.max(220, Math.round(node.clientWidth * 0.6));
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <main className=" flex flex-col min-h-screen bg-background text-foreground">
      <MaxWidth className="flex-1 space-y-6 py-4 md:py-6">
        {/* ─── HEADER ──────────────────────────────────────────────────── */}
        <header className="relative rounded-xl border bg-card p-3 shadow-sm md:p-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
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
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 pl-10"
              />
            </form>

            {/* Desktop: create listing */}
            <Button
              onClick={handleCreateListing}
              className="hidden h-11 rounded-full px-5 md:inline-flex"
            >
              <Upload size={16} /> Create listing
            </Button>

            {/* Desktop: theme toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Desktop: account when signed in, sign in when not */}
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

            {/* Desktop: notifications bell — always outside any menu */}
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

            {/* Mobile: notifications bell — always outside dropdown */}
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

            {/* ── Mobile hamburger dropdown ─────────────────────────── */}
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

                {/* Account */}
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <User size={16} /> Manage Account
                </DropdownMenuItem>

                {/* Create listing — mobile only */}
                <DropdownMenuItem onClick={handleCreateListing}>
                  <Upload size={16} /> Create listing
                </DropdownMenuItem>

                {/* Theme */}
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
          </div>

          {/* ── Notification panel ─────────────────────────────────────── */}
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
                    onChange={(event) => setUnreadOnly(event.target.checked)}
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
                    <div
                      key={item._id}
                      className={`rounded-md border p-2 text-sm ${item.read ? "bg-muted/20" : "bg-primary/10"}`}
                    >
                      {item.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </header>

        {authPrompt && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-4">
              <p className="text-sm">{authPrompt}</p>
              {!isAuthenticated && (
                <Button size="sm" onClick={() => router.push("/signin")}>
                  Go to sign in
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Image
            src={HomePageBanner}
            alt="Swap home page banner"
            width={1600}
            height={300}
            quality={100}
            priority
            className="h-auto w-full object-cover"
          />
        </section>

        <section className="rounded-xl border bg-card p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleViewChange("swap")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                currentView === "swap"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              Swap
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("browse")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                currentView === "browse"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              Browse
            </button>
          </div>
        </section>

        {currentView === "swap" && (
          <>
            {swipeTarget && (
              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mx-auto max-w-2xl">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Live Swap Deck
                      </p>
                      <div className="relative">
                        <div className="absolute left-3 top-3 z-10 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground shadow">
                          #{swipeIndex + 1}
                        </div>
                        <div
                          className="relative touch-none select-none"
                          onPointerDown={(event) => {
                            setDragStartX(event.clientX);
                            setIsSwiping(true);
                          }}
                          onPointerMove={(event) => {
                            if (dragStartX === null) return;
                            setDragX(event.clientX - dragStartX);
                          }}
                          onPointerUp={() => {
                            void handleCardSwipeEnd();
                          }}
                          onPointerCancel={() => {
                            setDragStartX(null);
                            setIsSwiping(false);
                            setDragX(0);
                          }}
                        >
                          <div
                            className="relative h-[58vh] min-h-[460px] overflow-hidden rounded-2xl border bg-muted/10 shadow-xl"
                            style={{
                              transform: `translateX(${dragX}px) rotate(${dragX * 0.03}deg)`,
                              transition: isSwiping
                                ? "none"
                                : "transform 180ms ease",
                            }}
                          >
                            <Image
                              src={
                                swipeTarget.images[0] ||
                                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                              }
                              alt={swipeTarget.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 text-white">
                              <p className="text-2xl font-bold">
                                {swipeTarget.title}
                              </p>
                              <p className="mt-1 text-sm text-white/85">
                                {swipeTarget.location}
                              </p>
                              {me?.id && swipeTarget.ownerId === me.id && (
                                <p className="mt-1 inline-flex rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-semibold text-black">
                                  Your listing
                                </p>
                              )}
                              <p className="mt-2 text-xl font-black">
                                {formatEgp(swipeTarget.priceEgp)}
                              </p>
                              <p className="mt-2 line-clamp-2 text-sm text-white/80">
                                {swipeTarget.summary}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`pointer-events-none absolute left-4 top-16 rounded-full px-3 py-1 text-xs font-bold ${
                              dragX > 30
                                ? "bg-emerald-500 text-white"
                                : "bg-white/80 text-transparent"
                            }`}
                          >
                            LIKE
                          </div>
                          <div
                            className={`pointer-events-none absolute right-4 top-16 rounded-full px-3 py-1 text-xs font-bold ${
                              dragX < -30
                                ? "bg-rose-500 text-white"
                                : "bg-white/80 text-transparent"
                            }`}
                          >
                            DISLIKE
                          </div>
                        </div>
                        <div className="pointer-events-none absolute -bottom-3 left-1/2 h-5 w-[92%] -translate-x-1/2 rounded-2xl bg-primary/10" />
                        <div className="pointer-events-none absolute -bottom-6 left-1/2 h-5 w-[84%] -translate-x-1/2 rounded-2xl bg-primary/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:content-start">
                  <Button
                    variant="destructive"
                    className="h-14 text-base"
                    onClick={() => void handleSwipe("dislike")}
                  >
                    <X size={18} /> Dislike
                  </Button>
                  <Button
                    className="h-14 text-base"
                    onClick={() => void handleSwipe("like")}
                  >
                    <Heart size={18} /> Like
                  </Button>
                </div>
              </section>
            )}

            {!swipeTarget && (
              <section className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
                No listings available for swipe yet. Create a listing or clear
                filters.
              </section>
            )}
          </>
        )}

        {currentView === "browse" && (
          <>
            <section className="rounded-xl border bg-card p-3 shadow-sm md:p-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCategories("left")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-background text-muted-foreground"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* fade + scrollbar-hidden wrapper */}
                <div className="relative flex-1 overflow-hidden">
                  {/* left fade */}
                  <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-card to-transparent" />
                  {/* right fade */}
                  <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-card to-transparent" />

                  <div
                    ref={categoryScrollerRef}
                    className="flex gap-2 overflow-x-auto px-2 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {categoryOptions.map((category) => {
                      const Icon =
                        categoryIcons[
                          category.id as keyof typeof categoryIcons
                        ] ?? Shapes;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setActiveCategory(category.id)}
                          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                            activeCategory === category.id
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-input bg-background text-foreground"
                          }`}
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted">
                            <Icon size={16} />
                          </span>
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => scrollCategories("right")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-background text-muted-foreground"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-xl border bg-card">
              <div className="relative h-44 md:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
                  alt="Featured banner"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/15" />
                <div className="absolute inset-0 flex items-end justify-between p-4 md:p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/80">
                      Featured Deal
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">
                      Swap Picks This Week
                    </h2>
                    <p className="mt-2 text-sm text-white/85 md:text-base">
                      Discover top listings and make your best offer.
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Featured</h3>
                <Badge variant="outline">{featured.length} items</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((product) => (
                  <Link key={product._id} href={`/products/${product.slug}`}>
                    <article className="overflow-hidden rounded-xl border bg-card transition hover:shadow-md">
                      <Image
                        src={
                          product.images[0] ||
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt={product.title}
                        width={600}
                        height={400}
                        className="h-40 w-full object-cover"
                      />
                      <div className="space-y-1 p-3">
                        <p className="text-xs text-muted-foreground">
                          {product.location}
                        </p>
                        <h4 className="line-clamp-2 font-semibold">
                          {product.title}
                        </h4>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {product.summary}
                        </p>
                        <p className="pt-1 text-lg font-bold text-primary">
                          {formatEgp(product.priceEgp)}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {activeCategory === "all"
                    ? "More For You"
                    : categoryNameById(activeCategory)}
                </h3>
                <Badge variant="outline">{listings.length} items</Badge>
              </div>

              {listings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No listings match your search.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {listings.map((product) => (
                    <Link key={product._id} href={`/products/${product.slug}`}>
                      <article className="overflow-hidden rounded-xl border bg-card transition hover:shadow-md">
                        <Image
                          src={
                            product.images[0] ||
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                          }
                          alt={product.title}
                          width={600}
                          height={400}
                          className="h-40 w-full object-cover"
                        />
                        <div className="space-y-1 p-3">
                          <p className="text-xs text-muted-foreground">
                            {product.location}
                          </p>
                          <h4 className="line-clamp-2 font-semibold">
                            {product.title}
                          </h4>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {product.summary}
                          </p>
                          <p className="pt-1 text-lg font-bold text-primary">
                            {formatEgp(product.priceEgp)}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </MaxWidth>
      <AppFooter />
    </main>
  );
}
