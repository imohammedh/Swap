"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

export default function FavoritesPage() {
  const favorites = useQuery(api.listings.listFavorites, {});

  if (favorites === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading favorites...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{favorites.length} Listings</p>

        {favorites.length === 0 ? (
          <div className="grid min-h-105 place-items-center rounded-lg border bg-muted/20 text-center">
            <div className="space-y-2">
              <p className="text-3xl">❤️</p>
              <p className="text-2xl font-semibold">No Results Found</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <Link key={item._id} href={`/products/${item.slug}`}>
                <article className="overflow-hidden rounded-xl border bg-card transition hover:shadow-md">
                  <Image
                    src={
                      item.images[0] ||
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={item.title}
                    width={600}
                    height={380}
                    className="h-40 w-full object-cover"
                  />
                  <div className="space-y-1 p-3">
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                    <h4 className="line-clamp-2 font-semibold">{item.title}</h4>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{item.summary}</p>
                    <p className="pt-1 text-lg font-bold text-primary">{formatEgp(item.priceEgp)}</p>
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
