"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { api } from "@/convex/_generated/api";
import MaxWidth from "@/components/max-width";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryNameById, categoryOptions } from "@/lib/categories";
import { egyptCities } from "@/lib/egypt-cities";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

function FilterFields({
  location,
  setLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  paymentType,
  setPaymentType,
  condition,
  setCondition,
  sort,
  setSort,
  onApply,
  onClear,
}: {
  location: string;
  setLocation: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  paymentType: string;
  setPaymentType: (v: string) => void;
  condition: string;
  setCondition: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Location</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-[220px] overflow-y-auto">
              <SelectItem value="all">All cities</SelectItem>
              {egyptCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Price range</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="From EGP"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            placeholder="To EGP"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Payment type</label>
        <div className="flex gap-2 text-sm flex-wrap">
          {[
            { value: "both", label: "All" },
            { value: "swap", label: "Swap" },
            { value: "cash", label: "Cash" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={`rounded-full border px-3 py-1 transition ${paymentType === item.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setPaymentType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Condition</label>
        <div className="flex gap-2 text-sm flex-wrap">
          {[
            { value: "", label: "All" },
            { value: "new", label: "New" },
            { value: "used", label: "Used" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={`rounded-full border px-3 py-1 transition ${condition === item.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setCondition(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Sort by</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Newest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price low to high</SelectItem>
            <SelectItem value="price-desc">Price high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onClear}>
          Clear all
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const q = params.get("q") ?? "";
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [location, setLocation] = useState(params.get("location") ?? "all");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [paymentType, setPaymentType] = useState(
    params.get("paymentType") ?? "both",
  );
  const [condition, setCondition] = useState(params.get("condition") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  const listings =
    useQuery(api.listings.listPublic, {
      search: q || undefined,
      categoryId: category === "all" ? undefined : category,
      location: location === "all" ? undefined : location,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      paymentType:
        paymentType === "both" ? undefined : (paymentType as "cash" | "swap"),
      condition: condition ? (condition as "new" | "used") : undefined,
    }) ?? [];

  const sorted = [...listings];
  if (sort === "price-asc") sorted.sort((a, b) => a.priceEgp - b.priceEgp);
  if (sort === "price-desc") sorted.sort((a, b) => b.priceEgp - a.priceEgp);

  const buildParams = (overrides: Record<string, string> = {}) => {
    const next = new URLSearchParams();
    const cat = overrides.category ?? category;
    if (q) next.set("q", q);
    if (cat !== "all") next.set("category", cat);
    if (location !== "all") next.set("location", location);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (paymentType !== "both") next.set("paymentType", paymentType);
    if (condition) next.set("condition", condition);
    if (sort !== "newest") next.set("sort", sort);
    return next.toString();
  };

  const applyFilters = () => router.replace(`/search?${buildParams()}`);

  const clearFilters = () => {
    setLocation("all");
    setMinPrice("");
    setMaxPrice("");
    setPaymentType("both");
    setCondition("");
    setSort("newest");
  };

  const handleCategoryClick = (id: string) => {
    setCategory(id);
    router.replace(`/search?${buildParams({ category: id })}`);
  };

  const filterProps = {
    location,
    setLocation,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    paymentType,
    setPaymentType,
    condition,
    setCondition,
    sort,
    setSort,
    onApply: applyFilters,
    onClear: clearFilters,
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MaxWidth className="space-y-4 py-4 md:py-6">
        {/* ── Category pills ── */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick("all")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              category === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            All
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                category === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Main layout: sidebar (desktop) + results ── */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Desktop sidebar filter panel */}
          <Card className="hidden lg:block h-fit ">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal size={15} /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterFields {...filterProps} />
            </CardContent>
          </Card>

          {/* Results column */}
          <div className="space-y-3">
            {/* Results header row with count + mobile filter button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {sorted.length} result(s)
                </p>
                <Badge variant="outline">{categoryNameById(category)}</Badge>
              </div>

              {/* Mobile filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2 lg:hidden">
                    <SlidersHorizontal size={14} /> Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-3"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <FilterFields {...filterProps} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Listing cards */}
            {sorted.map((product) => (
              <Link key={product._id} href={`/products/${product.slug}`}>
                <article className="grid overflow-hidden rounded-xl border bg-card transition hover:shadow-md md:grid-cols-[280px_1fr]">
                  <div className="relative h-44 md:h-full">
                    <Image
                      src={
                        product.images[0] ||
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs text-muted-foreground">
                      {product.location}
                    </p>
                    <h3 className="text-xl font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.summary}
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {formatEgp(product.priceEgp)}
                    </p>
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
      </MaxWidth>
    </main>
  );
}
