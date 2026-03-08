"use client";

import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryNameById } from "@/lib/categories";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();

  const listing = useQuery(api.listings.getBySlug, { slug: id });
  const swipe = useMutation(api.listings.swipe);
  const createOffer = useMutation(api.offers.create);
  const startConversation = useMutation(api.messages.startConversation);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDragStartX, setImageDragStartX] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);

  useEffect(() => {
    if (listing === null) notFound();
  }, [listing]);

  const handleImageSwipe = (direction: "left" | "right") => {
    if (!listing?.images?.length) return;
    setSelectedImageIndex((prev) => {
      if (direction === "left") {
        return prev === 0 ? listing.images!.length - 1 : prev - 1;
      } else {
        return prev === listing.images!.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const handleSwipe = async (direction: "like" | "dislike") => {
    if (!listing || !isAuthenticated) return;
    setActionError(null);
    try {
      await swipe({ listingId: listing._id, direction });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to swipe",
      );
    }
  };

  const handleCreateOffer = async (data: { type: string; amount?: number }) => {
    if (!listing || !isAuthenticated) return;
    setActionError(null);
    try {
      await createOffer({
        listingId: listing._id,
        amountEgp: data.amount || listing.priceEgp,
        message: `Offer type: ${data.type}`,
      });
      setOfferOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to create offer",
      );
    }
  };

  const handleContactSeller = async () => {
    if (!listing || !isAuthenticated) return;
    setActionError(null);
    try {
      const conversation = await startConversation({
        listingId: listing._id,
        message: `Hi! I'm interested in your ${listing.title}.`,
      });
      router.push(`/account/messages/${conversation}`);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to start conversation",
      );
    }
  };

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{actionError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={listing.images?.[selectedImageIndex] || fallbackImage}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image navigation */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageSwipe("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleImageSwipe("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Image indicators */}
              {listing.images && listing.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                  {listing.images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === selectedImageIndex
                          ? "bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 p-4">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 ${
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
                  <p className="text-2xl font-bold text-primary">
                    {formatEgp(listing.priceEgp)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryNameById(listing.categoryId)}
                    </Badge>
                    <Badge variant="outline">{listing.condition}</Badge>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {isAuthenticated && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwipe("like")}
                      >
                        <Heart size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwipe("dislike")}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{listing.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Verified seller • {listing.location}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {listing.ownerName?.[0] || "U"}
                </div>
                <div>
                  <p className="font-medium">{listing.ownerName}</p>
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm">0.0 (0 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Button
                className="w-full"
                onClick={handleContactSeller}
                disabled={!isAuthenticated}
              >
                <MessageCircle size={16} className="mr-2" />
                Contact Seller
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOfferOpen(true)}
                disabled={!isAuthenticated}
              >
                Make an Offer
              </Button>

              {!isAuthenticated && (
                <p className="text-center text-sm text-muted-foreground">
                  Sign in to contact seller and make offers
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Offer Modal */}
      {offerOpen && (
        <Card className="fixed inset-0 z-50 m-auto h-fit max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Make an Offer</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOfferOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => handleCreateOffer({ type: "swap" })}
              >
                <Check size={16} className="mr-2" />
                Swap Request
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateOffer({ type: "cash" })}
              >
                Cash Offer
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateOffer({ type: "both" })}
              >
                Swap or Cash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
