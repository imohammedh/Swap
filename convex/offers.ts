import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    listingId: v.id("listings"),
    amountEgp: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const buyerId = await getAuthUserId(ctx);
    if (!buyerId) throw new Error("Please sign in first.");

    const listing = await ctx.db.get(args.listingId);
    if (!listing || !listing.isPublished) throw new Error("Listing not found.");
    if (listing.ownerId === buyerId) {
      throw new Error("You cannot make an offer on your own listing.");
    }

    const amountEgp = Number(args.amountEgp);
    if (!Number.isFinite(amountEgp) || amountEgp <= 0) {
      throw new Error("Offer amount must be greater than 0.");
    }

    const offerId = await ctx.db.insert("offers", {
      listingId: args.listingId,
      buyerId,
      sellerId: listing.ownerId,
      amountEgp,
      message: args.message?.trim() || undefined,
      status: "pending",
    });

    return { offerId };
  },
});

export const listReceived = query({
  args: {
    search: v.optional(v.string()),
    minAmountEgp: v.optional(v.number()),
    maxAmountEgp: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
      ),
    ),
    fromTime: v.optional(v.number()),
    toTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sellerId = await getAuthUserId(ctx);
    if (!sellerId) return [];

    const all = await ctx.db
      .query("offers")
      .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
      .order("desc")
      .collect();

    const q = args.search?.trim().toLowerCase() ?? "";

    const rows = await Promise.all(
      all.map(async (offer) => {
        const listing = await ctx.db.get(offer.listingId);
        const buyer = await ctx.db.get(offer.buyerId);

        return {
          ...offer,
          listingSlug: listing?.slug ?? "",
          listingTitle: listing?.title ?? "Listing",
          listingImage:
            listing?.images[0] ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
          buyerName: buyer?.name ?? buyer?.email ?? "Unknown buyer",
        };
      }),
    );

    return rows.filter((offer) => {
      if (args.minAmountEgp !== undefined && offer.amountEgp < args.minAmountEgp) {
        return false;
      }
      if (args.maxAmountEgp !== undefined && offer.amountEgp > args.maxAmountEgp) {
        return false;
      }
      if (args.status && offer.status !== args.status) {
        return false;
      }
      if (args.fromTime !== undefined && offer._creationTime < args.fromTime) {
        return false;
      }
      if (args.toTime !== undefined && offer._creationTime > args.toTime) {
        return false;
      }
      if (!q) return true;

      return (
        offer.listingTitle.toLowerCase().includes(q) ||
        offer.buyerName.toLowerCase().includes(q) ||
        (offer.message?.toLowerCase().includes(q) ?? false)
      );
    });
  },
});

export const updateStatus = mutation({
  args: {
    offerId: v.id("offers"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const sellerId = await getAuthUserId(ctx);
    if (!sellerId) throw new Error("Please sign in first.");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found.");
    if (offer.sellerId !== sellerId) throw new Error("Unauthorized.");

    await ctx.db.patch(args.offerId, { status: args.status });
    return { ok: true };
  },
});
