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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Listings</CardTitle>
          <Button onClick={() => router.push("/signin")}>Sign in</Button>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Button onClick={() => router.push("/onboarding/listing")}>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Listings ({listings.length})</CardTitle>
        <Button onClick={() => router.push("/onboarding/listing")}>
          Create Listing
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link key={listing._id} href={`/products/${listing.slug}`}>
              <Card className="overflow-hidden transition hover:shadow-md">
                <div className="aspect-square overflow-hidden">
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
                  <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                  <p className="text-lg font-bold text-primary mt-2">
                    {formatEgp(listing.priceEgp)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
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
