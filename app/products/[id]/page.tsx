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
import AccountBreadcrumb from "@/components/account/account-breadcrumb";
import PageScaffold from "@/components/page-scaffold";
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
  const [offerSuccessOpen, setOfferSuccessOpen] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [sendingFollowup, setSendingFollowup] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const listingId = listing?._id;

  useEffect(() => {
    if (!listingId) return;
    setSelectedImageIndex(0);
    setImageDragStartX(null);
  }, [listingId]);

  if (listing === undefined) {
    return (
      <main className="min-h-screen bg-background p-8 text-center text-muted-foreground">
        Loading listing...
      </main>
    );
  }

  if (listing === null) {
    notFound();
  }

  const images = listing.images.length > 0 ? listing.images : [fallbackImage];
  const selectedImage = images[selectedImageIndex] ?? images[0];

  const showNextImage = () => {
    setSelectedImageIndex((current) => (current + 1) % images.length);
  };

  const showPreviousImage = () => {
    setSelectedImageIndex((current) => (current - 1 + images.length) % images.length);
  };

  const handleImagePointerUp = (clientX: number) => {
    if (imageDragStartX === null || images.length < 2) return;
    const delta = clientX - imageDragStartX;
    setImageDragStartX(null);
    if (delta > 40) {
      showPreviousImage();
      return;
    }
    if (delta < -40) {
      showNextImage();
    }
  };

  const openOfferModal = () => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    setActionError(null);
    setOfferAmount(String(Math.max(1, Math.round(listing.priceEgp))));
    setOfferOpen(true);
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    try {
      const result = await startConversation({ listingId: listing._id });
      setActionError(null);
      router.push(`/account/messages?conversation=${result.conversationId}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to open chat.");
    }
  };

  const handleSubmitOffer = async () => {
    const amountEgp = Number(offerAmount);
    if (!Number.isFinite(amountEgp) || amountEgp <= 0) {
      setActionError("Please enter a valid offer amount.");
      return;
    }

    setSubmittingOffer(true);
    setActionError(null);

    try {
      await createOffer({ listingId: listing._id, amountEgp });
      await swipe({ listingId: listing._id, direction: "like" });
      setOfferOpen(false);
      setOfferSuccessOpen(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to send offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleSendMessageAfterOffer = async () => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    setSendingFollowup(true);
    setActionError(null);

    try {
      const result = await startConversation({
        listingId: listing._id,
        message: offerMessage.trim() || undefined,
      });
      setOfferSuccessOpen(false);
      router.push(`/account/messages?conversation=${result.conversationId}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSendingFollowup(false);
    }
  };

  return (
    <PageScaffold maxWidthClassName="space-y-6 py-4 md:py-6">
      <AccountBreadcrumb tailLabel={listing.title} />

      <section className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent className="p-2 md:p-4">
            <div
              className="relative h-64 overflow-hidden rounded-lg md:h-[460px]"
              onPointerDown={(event) => setImageDragStartX(event.clientX)}
              onPointerUp={(event) => handleImagePointerUp(event.clientX)}
              onPointerCancel={() => setImageDragStartX(null)}
            >
              <Image src={selectedImage} alt={listing.title} fill className="object-cover" priority />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border md:h-20 md:w-28 ${
                    selectedImageIndex === index ? "border-primary ring-2 ring-primary/30" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${listing.title} preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{listing.ownerName}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="text-amber-500" /> 0.0 (0 ratings)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={openOfferModal}>
                  <Heart size={14} /> Make an offer
                </Button>
                <Button variant="outline" onClick={() => void handleMessageSeller()}>
                  <MessageCircle size={14} /> Message
                </Button>
              </div>
              {actionError && <p className="text-xs text-destructive">{actionError}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Likes: {listing.likeCount}</p>
                <p>Dislikes: {listing.dislikeCount}</p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => void swipe({ listingId: listing._id, direction: "dislike" })}
              >
                <X size={14} /> Dislike
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-300/70 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="text-base">Your safety matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>- Never transfer money in advance.</p>
              <p>- Meet the seller in a public place.</p>
              <p>- Stop if something feels wrong.</p>
              <Button variant="outline" className="mt-2 w-full">
                <ShieldAlert size={14} /> Report listing
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{listing.location}</Badge>
              <Badge variant="outline">{categoryNameById(listing.categoryId)}</Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="mt-2 text-3xl font-black text-primary">{formatEgp(listing.priceEgp)}</p>
              <p className="mt-3 text-muted-foreground">{listing.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {listing.details.map((detail) => (
              <div key={detail.key} className="rounded-md border bg-muted/30 p-3">
                <p className="text-muted-foreground">{detail.key}</p>
                <p className="font-medium">{detail.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {listing.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-4 shadow-2xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOfferOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">EGP</span>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(event) => setOfferAmount(event.target.value)}
                  className="h-11 flex-1 bg-transparent text-3xl font-semibold outline-none"
                />
                <span className="text-sm font-medium text-muted-foreground">EGP</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <p className="text-sm">
                <span className="text-muted-foreground">Offer Value</span>
                <br />
                <span className="font-bold">{offerAmount || 0} EGP</span>
              </p>
              <Button onClick={() => void handleSubmitOffer()} disabled={submittingOffer}>
                {submittingOffer ? "Submitting..." : "Submit offer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {offerSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-card px-6 pb-6 pt-10 text-center shadow-2xl">
            <div className="absolute -top-12 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center rounded-full border-4 border-card bg-amber-400 text-white shadow-lg">
              <Check size={36} />
            </div>

            <button
              type="button"
              onClick={() => setOfferSuccessOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <p className="mb-5 mt-8 text-lg font-medium">Your offer has been submitted successfully!</p>

            <textarea
              value={offerMessage}
              onChange={(event) => setOfferMessage(event.target.value)}
              rows={4}
              className="mb-4 w-full rounded-xl border bg-background p-3 text-sm"
              placeholder="Send the seller a message and speed up the process"
            />

            <div className="space-y-2">
              <Button
                className="h-12 w-full"
                onClick={() => void handleSendMessageAfterOffer()}
                disabled={sendingFollowup}
              >
                {sendingFollowup ? "Sending..." : "Send Message"}
              </Button>
              <Button
                className="h-12 w-full"
                variant="secondary"
                onClick={() => setOfferSuccessOpen(false)}
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageScaffold>
  );
}