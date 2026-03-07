"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatEgp(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} EGP`;
}

function toStartOfDayTimestamp(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

function toEndOfDayTimestamp(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

export default function OffersPage() {
  const [search, setSearch] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [applied, setApplied] = useState({
    search: "",
    minValue: "",
    maxValue: "",
    status: "all",
    fromDate: "",
    toDate: "",
  });

  const offers = useQuery(api.offers.listReceived, {
    search: applied.search || undefined,
    minAmountEgp: applied.minValue ? Number(applied.minValue) : undefined,
    maxAmountEgp: applied.maxValue ? Number(applied.maxValue) : undefined,
    status:
      applied.status === "all"
        ? undefined
        : (applied.status as "pending" | "accepted" | "rejected"),
    fromTime: toStartOfDayTimestamp(applied.fromDate),
    toTime: toEndOfDayTimestamp(applied.toDate),
  });

  const updateStatus = useMutation(api.offers.updateStatus);

  const loading = offers === undefined;
  const rows = offers ?? [];

  const statusBadgeClass = {
    pending: "bg-amber-500/15 text-amber-700",
    accepted: "bg-emerald-500/15 text-emerald-700",
    rejected: "bg-rose-500/15 text-rose-700",
  } as const;

  const applyFilters = () => {
    setApplied({ search, minValue, maxValue, status, fromDate, toDate });
  };

  const clearFilters = () => {
    setSearch("");
    setMinValue("");
    setMaxValue("");
    setStatus("all");
    setFromDate("");
    setToDate("");
    setApplied({
      search: "",
      minValue: "",
      maxValue: "",
      status: "all",
      fromDate: "",
      toDate: "",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offers</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
              size={14}
            />
            <Input
              className="pl-8"
              placeholder="Search in offers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <h3 className="font-semibold">Filters</h3>
            <Input
              placeholder="From value (EGP)"
              type="number"
              value={minValue}
              onChange={(event) => setMinValue(event.target.value)}
            />
            <Input
              placeholder="To value (EGP)"
              type="number"
              value={maxValue}
              onChange={(event) => setMaxValue(event.target.value)}
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            {loading ? (
              <div className="grid min-h-[420px] place-items-center text-center">
                <p className="text-sm text-muted-foreground">Loading offers...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div className="space-y-2">
                  <p className="text-xl font-semibold">No Results Found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((offer) => (
                  <article key={offer._id} className="overflow-hidden rounded-xl border bg-card">
                    <div className="grid gap-3 p-3 md:grid-cols-[160px_1fr]">
                      <Link href={`/products/${offer.listingSlug}`} className="relative h-28 overflow-hidden rounded-md">
                        <Image
                          src={offer.listingImage}
                          alt={offer.listingTitle}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link href={`/products/${offer.listingSlug}`} className="font-semibold hover:underline">
                            {offer.listingTitle}
                          </Link>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass[offer.status]}`}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">From: {offer.buyerName}</p>
                        <p className="text-lg font-bold text-primary">{formatEgp(offer.amountEgp)}</p>
                        {offer.message && <p className="text-sm text-muted-foreground">&ldquo;{offer.message}&rdquo;</p>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(offer._creationTime).toLocaleString()}
                        </p>
                        {offer.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => void updateStatus({ offerId: offer._id, status: "accepted" })}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void updateStatus({ offerId: offer._id, status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


