"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Filter, Search } from "lucide-react";

import { api } from "@/convex/_generated/api";
import AppFooter from "@/components/app-footer";
import MaxWidth from "@/components/max-width";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categoryNameById, categoryOptions } from "@/lib/categories";
import { egyptCities } from "@/lib/egypt-cities";

const vehiclesSubCategories = [
  "Cars For Sale",
  "Cars For Rent",
  "Motorcycles For Sale",
  "Motorcycles For Rent",
  "Boats & Watercraft",
  "Heavy Trucks & Buses",
  "Vehicles Accessories",
  "Vehicles Spare Parts",
];

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category] = useState(params.get("category") ?? "all");
  const [location, setLocation] = useState(params.get("location") ?? "all");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [paymentType, setPaymentType] = useState(params.get("paymentType") ?? "both");
  const [condition, setCondition] = useState(params.get("condition") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  const listings =
    useQuery(api.listings.listPublic, {
      search: q || undefined,
      categoryId: category,
      location: location === "all" ? undefined : location,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      paymentType: paymentType === "both" ? undefined : (paymentType as "cash" | "swap"),
      condition: condition ? (condition as "new" | "used") : undefined,
    }) ?? [];

  const sorted = [...listings];
  if (sort === "price-asc") sorted.sort((a, b) => a.priceEgp - b.priceEgp);
  if (sort === "price-desc") sorted.sort((a, b) => b.priceEgp - a.priceEgp);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category !== "all") next.set("category", category);
    if (location !== "all") next.set("location", location);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (paymentType !== "both") next.set("paymentType", paymentType);
    if (condition) next.set("condition", condition);
    if (sort !== "newest") next.set("sort", sort);
    router.replace(`/search?${next.toString()}`);
  };

  const clearFilters = () => {
    setLocation("all");
    setMinPrice("");
    setMaxPrice("");
    setPaymentType("both");
    setCondition("");
    setSort("newest");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MaxWidth className="space-y-4 py-4 md:py-6">
        <header className="flex flex-col gap-3 rounded-xl border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">{categoryNameById(category)}</h1>
          <div className="flex items-center gap-2">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="Search listings" />
            </div>
            <Button onClick={applyFilters}>Search</Button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter size={16} /> Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="all">All cities</option>
                  {egyptCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 border-y py-4">
                <button
                  type="button"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  <ChevronLeft size={14} /> {categoryNameById(category)}
                </button>
                <div className="space-y-1">
                  {(category === "vehicles" ? vehiclesSubCategories : categoryOptions.map((c) => c.name)).slice(0, 10).map((item) => (
                    <p key={item} className="text-sm text-muted-foreground">{item}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="From EGP" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <Input placeholder="To EGP" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment type</label>
                <div className="flex gap-2 text-sm">
                  {[
                    { value: "both", label: "All" },
                    { value: "swap", label: "Swap" },
                    { value: "cash", label: "Cash" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`rounded-full border px-3 py-1 ${paymentType === item.value ? "border-primary bg-primary text-primary-foreground" : ""}`}
                      onClick={() => setPaymentType(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <div className="flex gap-2 text-sm">
                  {[
                    { value: "", label: "All" },
                    { value: "new", label: "New" },
                    { value: "used", label: "Used" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`rounded-full border px-3 py-1 ${condition === item.value ? "border-primary bg-primary text-primary-foreground" : ""}`}
                      onClick={() => setCondition(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearFilters}>Clear all</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{sorted.length} result(s)</p>
              <Badge variant="outline">{categoryNameById(category)}</Badge>
            </div>
            <div className="space-y-3">
              {sorted.map((product) => (
                <Link key={product._id} href={`/products/${product.slug}`}>
                  <article className="grid overflow-hidden rounded-xl border bg-card transition hover:shadow-md md:grid-cols-[280px_1fr]">
                    <div className="relative h-44 md:h-full">
                      <Image
                        src={product.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-xs text-muted-foreground">{product.location}</p>
                      <h3 className="text-xl font-semibold">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.summary}</p>
                      <p className="text-2xl font-black text-primary">{formatEgp(product.priceEgp)}</p>
                    </div>
                  </article>
                </Link>
              ))}

              {sorted.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    No Results Found
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </MaxWidth>
      <AppFooter />
    </main>
  );
}

