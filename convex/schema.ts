import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  listings: defineTable({
    ownerId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    categoryId: v.string(),
    priceEgp: v.number(),
    location: v.string(),
    summary: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    features: v.array(v.string()),
    details: v.array(
      v.object({
        key: v.string(),
        value: v.string(),
      }),
    ),
    paymentType: v.optional(
      v.union(v.literal("cash"), v.literal("swap"), v.literal("both")),
    ),
    condition: v.optional(v.union(v.literal("new"), v.literal("used"))),
    likeCount: v.number(),
    dislikeCount: v.number(),
    isPublished: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_category", ["categoryId"]),

  swipes: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    direction: v.union(v.literal("like"), v.literal("dislike")),
  })
    .index("by_user_listing", ["userId", "listingId"])
    .index("by_user", ["userId"]),

  offers: defineTable({
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    amountEgp: v.number(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  })
    .index("by_seller", ["sellerId"])
    .index("by_buyer", ["buyerId"])
    .index("by_listing", ["listingId"]),

  notifications: defineTable({
    userId: v.id("users"),
    actorId: v.optional(v.id("users")),
    listingId: v.optional(v.id("listings")),
    type: v.union(v.literal("liked"), v.literal("disliked")),
    text: v.string(),
    read: v.boolean(),
  }).index("by_user", ["userId"]),

  conversations: defineTable({
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    createdBy: v.id("users"),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  })
    .index("by_listing_buyer", ["listingId", "buyerId"])
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
    readBy: v.array(v.id("users")),
  }).index("by_conversation_createdAt", ["conversationId", "createdAt"]),
});
