import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const health = query({
  args: {},
  handler: async () => {
    return { ok: true, service: "swap-backend" };
  },
});

export const myStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { authenticated: false, listings: 0, notifications: 0 };
    }

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      authenticated: true,
      listings: listings.length,
      notifications: notifications.length,
    };
  },
});

export const clearMyNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(notifications.map((item) => ctx.db.delete(item._id)));

    return { cleared: notifications.length };
  },
});
