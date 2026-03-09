"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const listings = useQuery(api.listings.listMine, {});

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>My Listings</CardTitle>
          <Button onClick={() => router.push("/signin")} className="w-full sm:w-auto">Sign in</Button>
        </CardHeader>
        <CardContent>
          <div className="grid min-h-[420px] place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium">Sign in required</p>
              <p className="text-sm text-muted-foreground">
                Please sign in to view your listings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!listings) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid min-h-[420px] place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium">No listings yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first listing to get started.
              </p>
              <Button onClick={() => router.push("/onboarding/listing")} className="w-full sm:w-auto">
                Create Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>My Listings ({listings.length})</CardTitle>
        <Button onClick={() => router.push("/onboarding/listing")} className="w-full sm:w-auto">
          Create Listing
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link key={listing._id} href={`/products/${listing.slug}`}>
              <Card className="overflow-hidden transition hover:shadow-md">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={
                      listing.images?.[0] ||
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="line-clamp-1 font-semibold">{listing.title}</h3>
                  <p className="mt-2 text-lg font-bold text-primary">
                    {formatEgp(listing.priceEgp)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {listing.location}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
