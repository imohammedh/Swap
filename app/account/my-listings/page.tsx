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
              <p className="text-2xl font-semibold">Sign in to view your listings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listings === undefined) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Listings</CardTitle>
          <Link href="/onboarding/listing">
            <Button>Create Listing</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading listings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Listings</CardTitle>
        <Link href="/onboarding/listing">
          <Button>Create Listing</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{listings.length} listing(s)</p>

        {listings.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <p className="text-3xl">No Listings Yet</p>
              <p className="text-sm text-muted-foreground">
                Start onboarding to publish your first product.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    <p className="text-xs text-muted-foreground">{product.location}</p>
                    <h4 className="line-clamp-2 font-semibold">{product.title}</h4>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{product.summary}</p>
                    <p className="pt-1 text-lg font-bold text-primary">
                      {formatEgp(product.priceEgp)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
