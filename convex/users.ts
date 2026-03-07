import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    return user
      ? {
          id: user._id,
          name: user.name ?? null,
          email: user.email ?? null,
          phone: user.phone ?? null,
          image: user.image ?? null,
        }
      : null;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const current = await ctx.db.get(userId);
    if (!current) throw new Error("User not found.");

    const preferredName = args.name?.trim() || current.name?.trim() || current.email?.split("@")[0]?.trim() || "Swap User";
    const phone = args.phone?.trim() || undefined;

    let image = current.image ?? undefined;
    if (args.imageStorageId) {
      image = (await ctx.storage.getUrl(args.imageStorageId)) ?? image;
    }

    await ctx.db.patch(userId, {
      name: preferredName,
      phone,
      image,
    });

    return { ok: true };
  },
});
