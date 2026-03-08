"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import MaxWidth from "@/components/max-width";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryNameById, categoryOptions } from "@/lib/categories";
import HomePageBanner from "@/public/Swap-HomePageBanner.svg";
import HomePageBannerFeatured from "@/public/Swap-HomePageBannerFeatured.svg";

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

function HorizontalSlider({
  children,
  scrollAmount = 720,
}: {
  children: ReactNode;
  scrollAmount?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const node = scrollerRef.current;
    if (!node) return;

    const onScroll = () => updateScrollState();
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(node);

    return () => {
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollToEdge = (direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({
      left: direction === "left" ? 0 : node.scrollWidth - node.clientWidth,
      behavior: "smooth",
    });
  };

  const scroll = (direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;

    const items = Array.from(
      node.querySelectorAll<HTMLElement>('[data-slider-item="true"]'),
    );
    if (items.length === 0) {
      node.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      return;
    }

    const current = node.scrollLeft;
    const tolerance = 8;
    if (direction === "right") {
      const target = items.find(
        (item) => item.offsetLeft > current + tolerance,
      );
      if (target) {
        node.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
      } else {
        scrollToEdge("right");
      }
      return;
    }

    for (let i = items.length - 1; i >= 0; i -= 1) {
      const item = items[i];
      if (item.offsetLeft < current - tolerance) {
        node.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
        return;
      }
    }
    scrollToEdge("left");
  };

  return (
    <div className="relative w-full">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/90 text-muted-foreground shadow-sm backdrop-blur"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <div className="relative overflow-hidden">
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-linear-to-r from-background to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-linear-to-l from-background to-transparent" />
        )}

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-1 px-1 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);

  // Track scroll position to show/hide arrows and fades
  const updateScrollState = () => {
    const node = categoryScrollerRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    const node = categoryScrollerRef.current;
    if (!node) return;
    // Initial check
    updateScrollState();
    node.addEventListener("scroll", updateScrollState);
    // Re-check on resize (e.g. window resize or container changes)
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(node);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, []);

  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") === "swap" ? "swap" : "browse";

  const listings =
    useQuery(api.listings.listPublic, {
      search: searchTerm || undefined,
      categoryId: activeCategory,
    }) ?? [];

  const swipeDeck =
    useQuery(api.listings.listForDeck, {
      search: searchTerm || undefined,
      categoryId: activeCategory,
      limit: 50,
    }) ?? [];

  const me = useQuery(api.users.me, {});
  const swipe = useMutation(api.listings.swipe);

  const featured = listings.slice(0, 4);

  const swipeTarget = swipeDeck[swipeIndex % Math.max(swipeDeck.length, 1)];

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

  const onlyMine = Boolean(
    isAuthenticated &&
    me?.id &&
    listings.length > 0 &&
    listings.every((l) => l.ownerId === me.id),
  );

  const hasFilters = Boolean(searchTerm.trim() || activeCategory !== "all");

  const clearSwapFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
    setSwipeIndex(0);
    setAuthPrompt(null);
  };
  const swipeEmptyMessage = !isAuthenticated
    ? "Sign in to start swiping. You can still browse listings."
    : onlyMine
      ? "No other listings yet. Your listings don't appear in the swap deck."
      : "You're all caught up ? you've swiped everything that matches your filters (your listings are excluded).";
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
    <>
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

      <section className="relative overflow-hidden rounded-xl border bg-card">
        <div className="relative h-44 md:h-64">
          <Image
            src={HomePageBanner}
            alt="Featured banner"
            fill
            quality={100}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/15" />
          <div className="absolute inset-0 flex items-end justify-between p-4 md:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">
                just for you
              </p>
              <h2 className="mt-1 text-4xl max-w-lg font-black text-secondary-foreground md:text-4xl">
                if you don't want to you don't have to
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
                you don't have to keep swapping move to the browse tap and
                search for what exactly you want
              </p>
            </div>
          </div>
        </div>
        <div className=" w-full flex justify-center items-center">
          <div className="max-w-3xl p-4 flex gap-2 items-center flex-1 justify-center text-center">
            <button
              type="button"
              onClick={() => handleViewChange("swap")}
              className={`rounded-lg flex-1 px-4 py-2 text-sm font-semibold transition ${
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
              className={`rounded-lg flex-1 px-4 py-2 text-sm font-semibold transition ${
                currentView === "browse"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              Browse
            </button>
          </div>
        </div>
      </section>
      {currentView === "swap" && (
        <>
          {swipeTarget && (
            <section className="relative">
              <div className="relative mx-auto max-w-4xl lg:px-24">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mx-auto max-w-2xl">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Live Swap Deck
                      </p>
                      <div className="relative w-full">
                        <div
                          className="relative touch-none select-none cursor-grab active:cursor-grabbing"
                          onPointerDown={(event) => {
                            if (
                              event.pointerType === "mouse" &&
                              event.button !== 0
                            )
                              return;
                            event.preventDefault();
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            );
                            setDragStartX(event.clientX);
                            setIsSwiping(true);
                          }}
                          onPointerMove={(event) => {
                            if (dragStartX === null) return;
                            setDragX(event.clientX - dragStartX);
                          }}
                          onPointerUp={(event) => {
                            try {
                              event.currentTarget.releasePointerCapture(
                                event.pointerId,
                              );
                            } catch {}
                            void handleCardSwipeEnd();
                          }}
                          onPointerCancel={(event) => {
                            try {
                              event.currentTarget.releasePointerCapture(
                                event.pointerId,
                              );
                            } catch {}
                            setDragStartX(null);
                            setIsSwiping(false);
                            setDragX(0);
                          }}
                        >
                          <div
                            className="relative h-[58vh] min-h-115 overflow-hidden rounded-2xl"
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
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/40 to-transparent p-5 text-white">
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
                                : "bg-transparent text-transparent"
                            }`}
                          >
                            LIKE
                          </div>
                          <div
                            className={`pointer-events-none absolute right-4 top-16 rounded-full px-3 py-1 text-xs font-bold ${
                              dragX < -30
                                ? "bg-rose-500 text-white"
                                : "bg-transparent text-transparent"
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
              </div>
            </section>
          )}

          {!swipeTarget && (
            <section className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
              <p>{swipeEmptyMessage}</p>
              {hasFilters && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSwapFilters}
                  >
                    Clear filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleViewChange("browse")}
                  >
                    Browse listings
                  </Button>
                </div>
              )}
              {hasFilters && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Active filters:{" "}
                  {activeCategory !== "all"
                    ? categoryNameById(activeCategory)
                    : "All"}
                  {searchTerm.trim() ? ` ? ?${searchTerm.trim()}?` : ""}
                </p>
              )}
            </section>
          )}
        </>
      )}

      {currentView === "browse" && (
        <>
          <section className="rounded-xl bg-transparent py-3 md:py-4">
            <div className="relative">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCategories("left")}
                  className="absolute -left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur md:-left-4"
                >
                  <ChevronLeft size={14} />
                </button>
              )}

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCategories("right")}
                  className="absolute -right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur md:-right-4"
                >
                  <ChevronRight size={14} />
                </button>
              )}

              {/* fade + scrollbar-hidden wrapper */}
              <div className="relative overflow-hidden">
                {/* left fade â€” only when scrollable left */}
                {canScrollLeft && (
                  <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-linear-to-r from-background to-transparent" />
                )}
                {/* right fade â€” only when scrollable right */}
                {canScrollRight && (
                  <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-linear-to-l from-background to-transparent" />
                )}

                <div
                  ref={categoryScrollerRef}
                  className={`flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden ${canScrollLeft ? "pl-10" : "pl-2"} ${canScrollRight ? "pr-10" : "pr-2"}`}
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
                        className={`flex shrink-0 items-center gap-2 rounded-full border bg-primary-foreground px-3 py-2 text-sm font-medium transition ${
                          activeCategory === category.id
                            ? "border-primary bg-primary-foreground/10 text-primary"
                            : "border-input bg-primary-foreground text-primary"
                        }`}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary">
                          <Icon
                            size={16}
                            className=" text-primary-foreground"
                          />
                        </span>
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border bg-card">
            <div className="relative h-44 md:h-64">
              <Image
                src={HomePageBannerFeatured}
                alt="Featured banner"
                fill
                quality={100}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/15" />
              <div className="absolute inset-0 flex items-end justify-between p-4 md:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/80">
                    Featured Deal
                  </p>
                  <h2 className="mt-1 text-4xl font-black text-secondary-foreground md:text-4xl">
                    we're just launched{" "}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
                    so we may not have too many deals right now but you can go a
                    head and start your own listing and show people what you
                    have to offer
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Featured</h3>
              <Badge variant="outline">{featured.length} items</Badge>
            </div>
            <HorizontalSlider>
              {featured.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  data-slider-item="true"
                  className="block w-[260px] shrink-0 snap-start sm:w-[300px] lg:w-[320px]"
                >
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
            </HorizontalSlider>
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
              <HorizontalSlider>
                {listings.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    data-slider-item="true"
                    className="block w-[260px] shrink-0 snap-start sm:w-[300px] lg:w-[320px]"
                  >
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
              </HorizontalSlider>
            )}
          </section>
        </>
      )}
    </>
  );
}
