"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import AppFooter from "@/components/app-footer";
import MaxWidth from "@/components/max-width";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryNameById } from "@/lib/categories";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

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
  const startConversation = useMutation(api.messages.startConversation);
  const [actionError, setActionError] = useState<string | null>(null);

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
      setActionError(
        error instanceof Error ? error.message : "Failed to open chat.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MaxWidth className="space-y-6 py-4 md:py-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <span>/</span>
          <span>{categoryNameById(listing.categoryId)}</span>
          <span>/</span>
          <span className="text-foreground">{listing.title}</span>
        </div>

        <section className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardContent className="p-2 md:p-4">
              <div className="relative h-64 overflow-hidden rounded-lg md:h-[460px]">
                <Image
                  src={
                    listing.images[0] ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
                {listing.images.map((image, index) => (
                  <div
                    key={image + index}
                    className="relative h-16 overflow-hidden rounded-md border md:h-20"
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
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
                  <Button
                    onClick={() =>
                      void swipe({ listingId: listing._id, direction: "like" })
                    }
                  >
                    <Heart size={14} /> Make an offer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleMessageSeller()}
                  >
                    <MessageCircle size={14} /> Message
                  </Button>
                </div>
                {actionError && (
                  <p className="text-xs text-destructive">{actionError}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Likes: {listing.likeCount}</p>
                  <p>Dislikes: {listing.dislikeCount}</p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() =>
                    void swipe({ listingId: listing._id, direction: "dislike" })
                  }
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
              </div>

              <div>
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <p className="mt-2 text-3xl font-black text-primary">
                  {formatEgp(listing.priceEgp)}
                </p>
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
      </MaxWidth>
      <AppFooter />
    </main>
  );
}
