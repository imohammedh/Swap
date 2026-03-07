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
    name: v.string(),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const name = args.name.trim();
    if (!name) throw new Error("Name is required.");

    const phone = args.phone?.trim() || undefined;
    const image = args.image?.trim() || undefined;

    await ctx.db.patch(userId, {
      name,
      phone,
      image,
    });

    return { ok: true };
  },
});
