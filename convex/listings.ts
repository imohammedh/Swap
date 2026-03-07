import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export const listPublic = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    location: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    paymentType: v.optional(
      v.union(v.literal("cash"), v.literal("swap"), v.literal("both")),
    ),
    condition: v.optional(v.union(v.literal("new"), v.literal("used"))),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("listings").order("desc").collect();
    const q = args.search?.trim().toLowerCase() ?? "";

    const filtered = all.filter((listing) => {
      if (!listing.isPublished) return false;

      if (
        args.categoryId &&
        args.categoryId !== "all" &&
        listing.categoryId !== args.categoryId
      ) {
        return false;
      }

      if (args.location && args.location !== "all" && listing.location !== args.location) {
        return false;
      }

      if (args.minPrice !== undefined && listing.priceEgp < args.minPrice) return false;
      if (args.maxPrice !== undefined && listing.priceEgp > args.maxPrice) return false;

      if (args.paymentType && args.paymentType !== "both") {
        const p = listing.paymentType ?? "both";
        if (p !== args.paymentType && p !== "both") return false;
      }

      if (args.condition && (listing.condition ?? "used") !== args.condition) return false;

      if (!q) return true;

      return (
        listing.title.toLowerCase().includes(q) ||
        listing.location.toLowerCase().includes(q) ||
        listing.summary.toLowerCase().includes(q)
      );
    });

    return Promise.all(
      filtered.map(async (listing) => {
        const owner = await ctx.db.get(listing.ownerId);
        return {
          ...listing,
          ownerName: owner?.name ?? owner?.email ?? "Unknown",
        };
      }),
    );
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("listings")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const listFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const likes = await ctx.db
      .query("swipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const likedRows = likes.filter((row) => row.direction === "like");

    const favorites = await Promise.all(
      likedRows.map(async (like) => {
        const listing = await ctx.db.get(like.listingId);
        if (!listing || !listing.isPublished) return null;

        const owner = await ctx.db.get(listing.ownerId);
        return {
          ...listing,
          ownerName: owner?.name ?? owner?.email ?? "Unknown",
          likedAt: like._creationTime,
        };
      }),
    );

    return favorites.filter((value): value is NonNullable<typeof value> => value !== null);
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!listing || !listing.isPublished) return null;

    const owner = await ctx.db.get(listing.ownerId);

    return {
      ...listing,
      ownerName: owner?.name ?? owner?.email ?? "Unknown",
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    categoryId: v.string(),
    priceEgp: v.number(),
    location: v.string(),
    summary: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id("_storage")),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    paymentType: v.optional(
      v.union(v.literal("cash"), v.literal("swap"), v.literal("both")),
    ),
    condition: v.optional(v.union(v.literal("new"), v.literal("used"))),
    features: v.optional(v.array(v.string())),
    details: v.optional(
      v.array(
        v.object({
          key: v.string(),
          value: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const base = toSlug(args.title);
    const slug = `${base}-${Date.now().toString().slice(-6)}`;

    const storageIds = [...(args.imageStorageIds ?? [])];
    if (args.imageStorageId) {
      storageIds.push(args.imageStorageId);
    }
    if (storageIds.length > 5) {
      throw new Error("You can upload up to 5 images per listing.");
    }

    const images: string[] = [];
    for (const storageId of storageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) images.push(url);
    }

    const fallbackUrls = [
      ...(args.imageUrls ?? []),
      ...(args.imageUrl ? [args.imageUrl] : []),
    ]
      .map((url) => url.trim())
      .filter(Boolean);

    for (const url of fallbackUrls) {
      if (images.length >= 5) break;
      if (!images.includes(url)) images.push(url);
    }

    const id = await ctx.db.insert("listings", {
      ownerId: userId,
      slug,
      title: args.title.trim(),
      categoryId: args.categoryId,
      priceEgp: args.priceEgp,
      location: args.location.trim(),
      summary: args.summary.trim(),
      description: args.description.trim(),
      images,
      features: args.features ?? [],
      details: args.details ?? [],
      paymentType: args.paymentType ?? "both",
      condition: args.condition ?? "used",
      likeCount: 0,
      dislikeCount: 0,
      isPublished: true,
    });

    return { id, slug };
  },
});

export const swipe = mutation({
  args: {
    listingId: v.id("listings"),
    direction: v.union(v.literal("like"), v.literal("dislike")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found.");

    if (listing.ownerId === userId) {
      return {
        ok: true,
        skipped: true,
        reason: "own_listing" as const,
        likeCount: listing.likeCount,
        dislikeCount: listing.dislikeCount,
      };
    }

    const existing = await ctx.db
      .query("swipes")
      .withIndex("by_user_listing", (q) =>
        q.eq("userId", userId).eq("listingId", args.listingId),
      )
      .first();

    if (existing?.direction === args.direction) {
      return {
        ok: true,
        skipped: false,
        likeCount: listing.likeCount,
        dislikeCount: listing.dislikeCount,
      };
    }

    let likeCount = listing.likeCount;
    let dislikeCount = listing.dislikeCount;

    if (existing) {
      if (existing.direction === "like") likeCount = Math.max(0, likeCount - 1);
      if (existing.direction === "dislike") {
        dislikeCount = Math.max(0, dislikeCount - 1);
      }
      await ctx.db.patch(existing._id, { direction: args.direction });
    } else {
      await ctx.db.insert("swipes", {
        userId,
        listingId: args.listingId,
        direction: args.direction,
      });
    }

    if (args.direction === "like") likeCount += 1;
    if (args.direction === "dislike") dislikeCount += 1;

    await ctx.db.patch(args.listingId, { likeCount, dislikeCount });

    const actor = await ctx.db.get(userId);
    const actorName = actor?.name ?? actor?.email ?? "Someone";

    await ctx.db.insert("notifications", {
      userId: listing.ownerId,
      actorId: userId,
      listingId: args.listingId,
      type: args.direction === "like" ? "liked" : "disliked",
      text:
        args.direction === "like"
          ? `${actorName} liked your listing: ${listing.title}`
          : `${actorName} disliked your listing: ${listing.title}`,
      read: false,
    });

    return { ok: true, skipped: false, likeCount, dislikeCount };
  },
});
