"use client";

import Image from "next/image";
import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Pencil,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();

  const me = useQuery(api.users.me, {});
  const listing = useQuery(api.listings.getBySlug, { slug: id });
  const swipe = useMutation(api.listings.swipe);
  const createOffer = useMutation(api.offers.create);
  const startConversation = useMutation(api.messages.startConversation);
  const removeListing = useMutation(api.listings.remove);

  const isOwner = Boolean(
    isAuthenticated && me?.id && listing?.ownerId === me.id,
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDragStartX, setImageDragStartX] = useState<number | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerSuccessOpen, setOfferSuccessOpen] = useState(false);
  const [offerAmountInput, setOfferAmountInput] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerLastAmountEgp, setOfferLastAmountEgp] = useState<number | null>(
    null,
  );
  const [startingConversation, setStartingConversation] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [deletingListing, setDeletingListing] = useState(false);

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

  const getNextUrl = () => {
    const query = searchParams.toString();
    return query ? pathname + "?" + query : pathname;
  };

  const redirectToSignIn = () => {
    router.push("/signin?next=" + encodeURIComponent(getNextUrl()));
  };

  const handleSwipe = async (direction: "like" | "dislike") => {
    if (!listing) return;
    if (!isAuthenticated) {
      redirectToSignIn();
      return;
    }
    // errors via toaster
    try {
      await swipe({ listingId: listing._id, direction });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to swipe",
      });
    }
  };

  const handleContactSeller = async () => {
    if (!listing || !isAuthenticated) return;

    if (isOwner) {
      toast({
        variant: "destructive",
        title: "You own this listing",
        description: "You cannot contact yourself.",
      });
      return;
    }

    // errors via toaster
    try {
      const { conversationId } = await startConversation({
        listingId: listing._id,
        message: `Hi! I'm interested in your ${listing.title}.`,
      });
      router.push(`/account/messages?id=${conversationId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't open chat",
        description:
          error instanceof Error ? error.message : "Failed to start conversation",
      });
    }
  };

  const openOfferDialog = () => {
    if (!listing || !isAuthenticated) return;

    if (isOwner) {
      toast({
        variant: "destructive",
        title: "Cannot make an offer",
        description: "You cannot make an offer on your own listing.",
      });
      return;
    }

    setOfferAmountInput(String(listing.priceEgp ?? ""));
    setOfferOpen(true);
  };

  const handleSubmitOffer = async () => {
    if (!listing || !isAuthenticated) return;

    setOfferSubmitting(true);
    try {
      const amountEgp = Number(offerAmountInput);
      if (!Number.isFinite(amountEgp) || amountEgp <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid offer amount.",
        });
        return;
      }

      await createOffer({
        listingId: listing._id,
        amountEgp,
        message: "Offer submitted from listing page.",
      });

      setOfferLastAmountEgp(amountEgp);
      setOfferOpen(false);
      setOfferSuccessOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Offer failed",
        description:
          error instanceof Error ? error.message : "Failed to submit offer",
      });
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleSendOfferMessage = async () => {
    if (!listing || !isAuthenticated) return;

    if (isOwner) {
      toast({
        variant: "destructive",
        title: "You own this listing",
        description: "You cannot message yourself.",
      });
      return;
    }
    setStartingConversation(true);
    try {
      const offerAmount = offerLastAmountEgp ?? listing.priceEgp;
      const { conversationId } = await startConversation({
        listingId: listing._id,
        message: `Hi! I just made an offer of ${formatEgp(offerAmount)} for your ${listing.title}. I'm ready to buy - is it still available?`,
      });
      setOfferSuccessOpen(false);
      router.push(`/account/messages?id=${conversationId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't open chat",
        description:
          error instanceof Error ? error.message : "Failed to start conversation",
      });
    } finally {
      setStartingConversation(false);
    }
  };
  const handleDeleteListing = async () => {
    if (!listing || !isAuthenticated) return;
    if (!isOwner) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Only the seller can delete this listing.",
      });
      return;
    }

    setDeletingListing(true);
    try {
      await removeListing({ listingId: listing._id });
      toast({ title: "Listing deleted" });
      setManageOpen(false);
      router.push("/account/my-listings");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete listing",
      });
    } finally {
      setDeletingListing(false);
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

  const likeCount = listing.likeCount ?? 0;
  const dislikeCount = listing.dislikeCount ?? 0;

  return (
    <div className="space-y-6">
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
                <div className="min-w-0 space-y-2">
                  <CardTitle className="break-words text-xl">
                    {listing.title}
                  </CardTitle>
                  <p className="text-2xl font-bold text-primary">
                    {formatEgp(listing.priceEgp)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryNameById(listing.categoryId)}
                    </Badge>
                    <Badge variant="outline">{listing.condition}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="tabular-nums">{likeCount}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <X className="h-4 w-4" />
                      <span className="tabular-nums">{dislikeCount}</span>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {isAuthenticated && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleSwipe("like")}
                      >
                        <Heart size={16} />
                        <span className="text-xs tabular-nums">{likeCount}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleSwipe("dislike")}
                      >
                        <X size={16} />
                        <span className="text-xs tabular-nums">{dislikeCount}</span>
                      </Button>
                    </>
                  )}
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="max-w-full whitespace-pre-wrap break-words text-muted-foreground">{listing.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-muted-foreground" />
                  <span className="max-w-full break-words text-sm text-muted-foreground">
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
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={listing.ownerImage ?? undefined}
                    alt={listing.ownerName ?? "Seller"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {listing.ownerName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{listing.ownerName}</p>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">0.0 (0 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              {isOwner ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setManageOpen(true)}
                    disabled={!isAuthenticated}
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit Listing
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    You are the seller. Buyer actions are hidden.
                  </p>
                </>
              ) : (
                <>
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
                    onClick={openOfferDialog}
                    disabled={!isAuthenticated}
                  >
                    Make an Offer
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-center text-sm text-muted-foreground">
                      Sign in to contact seller and make offers
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
                </div>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>
              Manage your listing. Deleting will remove it from the marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/20 p-3 text-sm">
            <p className="font-medium">{listing.title}</p>
            <p className="text-muted-foreground">{formatEgp(listing.priceEgp)}</p>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteListing}
              disabled={deletingListing}
            >
              <Trash2 size={16} className="mr-2" />
              {deletingListing ? "Deleting..." : "Delete listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an offer</DialogTitle>
            <DialogDescription>
              Enter your offer price. You can continue browsing, or submit the
              offer now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                type="number"
                min={1}
                value={offerAmountInput}
                onChange={(e) => setOfferAmountInput(e.target.value)}
                placeholder={String(listing.priceEgp)}
                disabled={offerSubmitting}
              />
              <span className="max-w-full break-words text-sm text-muted-foreground">EGP</span>
            </div>

            {Number(offerAmountInput) > 0 &&
              Number.isFinite(Number(offerAmountInput)) && (
                <p className="text-xs text-muted-foreground">
                  Offer value: {formatEgp(Number(offerAmountInput))}
                </p>
              )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOfferOpen(false)}
              disabled={offerSubmitting}
            >
              Continue browsing
            </Button>
            <Button
              type="button"
              onClick={handleSubmitOffer}
              disabled={offerSubmitting}
            >
              {offerSubmitting ? "Submitting..." : "Make offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={offerSuccessOpen} onOpenChange={setOfferSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check size={28} />
              </div>
                </div>
            <DialogTitle className="text-center">
              Your offer has been submitted successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Send the seller a message and speed up the process.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
            <Button
              type="button"
              onClick={handleSendOfferMessage}
              disabled={startingConversation}
            >
              {startingConversation ? "Opening chat..." : "Send message"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOfferSuccessOpen(false)}
              disabled={startingConversation}
            >
              Continue browsing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

