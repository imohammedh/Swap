import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

function isParticipant(
  conversation: Doc<"conversations">,
  userId: Id<"users">,
) {
  return conversation.buyerId === userId || conversation.sellerId === userId;
}

export const startConversation = mutation({
  args: {
    listingId: v.id("listings"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const listing = await ctx.db.get(args.listingId);
    if (!listing || !listing.isPublished) throw new Error("Listing not found.");
    if (listing.ownerId === userId)
      throw new Error("You cannot message your own listing.");

    const now = Date.now();
    const initialMessage = args.message?.trim();

    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_listing_buyer", (q) =>
        q.eq("listingId", args.listingId).eq("buyerId", userId),
      )
      .first();

    if (!conversation) {
      const conversationId = await ctx.db.insert("conversations", {
        listingId: args.listingId,
        buyerId: userId,
        sellerId: listing.ownerId,
        createdBy: userId,
        lastMessageAt: now,
        lastMessagePreview: initialMessage,
      });
      conversation = await ctx.db.get(conversationId);
    }

    if (!conversation) throw new Error("Failed to create conversation.");

    if (initialMessage) {
      await ctx.db.insert("messages", {
        conversationId: conversation._id,
        senderId: userId,
        body: initialMessage,
        createdAt: now,
        readBy: [userId],
      });

      await ctx.db.patch(conversation._id, {
        lastMessageAt: now,
        lastMessagePreview: initialMessage,
      });
    }

    return { conversationId: conversation._id };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const [asBuyer, asSeller] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_buyer", (q) => q.eq("buyerId", userId))
        .collect(),
      ctx.db
        .query("conversations")
        .withIndex("by_seller", (q) => q.eq("sellerId", userId))
        .collect(),
    ]);

    const all = [...asBuyer, ...asSeller].sort(
      (a, b) => b.lastMessageAt - a.lastMessageAt,
    );

    return Promise.all(
      all.map(async (conversation) => {
        const listing = await ctx.db.get(conversation.listingId);
        const otherUserId =
          conversation.buyerId === userId
            ? conversation.sellerId
            : conversation.buyerId;
        const otherUser = await ctx.db.get(otherUserId);

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation_createdAt", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .collect();

        const unreadCount = messages.filter(
          (message) =>
            message.senderId !== userId && !message.readBy.includes(userId),
        ).length;

        const currentUserId = userId;
        const participants = [
          {
            userId: conversation.buyerId,
            name:
              conversation.buyerId === currentUserId
                ? "You"
                : otherUser?.name || otherUser?.email || "Unknown",
          },
          {
            userId: conversation.sellerId,
            name:
              conversation.sellerId === currentUserId
                ? "You"
                : otherUser?.name || otherUser?.email || "Unknown",
          },
        ];

        return {
          ...conversation,
          listing: listing
            ? {
                _id: listing._id,
                title: listing.title,
                slug: listing.slug,
              }
            : null,
          participants,
          currentUserId,
          messages,
          otherUserName: otherUser?.name ?? otherUser?.email ?? "Unknown user",
          unreadCount,
        };
      }),
    );
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];
    if (!isParticipant(conversation, userId)) {
      throw new Error("Unauthorized conversation access.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.name ?? sender?.email ?? "Unknown",
          isMine: message.senderId === userId,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found.");
    if (!isParticipant(conversation, userId)) {
      throw new Error("Unauthorized conversation access.");
    }

    const body = args.body.trim();
    if (!body) throw new Error("Message cannot be empty.");

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      body,
      createdAt: now,
      readBy: [userId],
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessagePreview: body,
    });

    return { messageId };
  },
});

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in first.");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return { updated: 0 };
    if (!isParticipant(conversation, userId)) {
      throw new Error("Unauthorized conversation access.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const unread = messages.filter(
      (message) => !message.readBy.includes(userId),
    );

    await Promise.all(
      unread.map((message) =>
        ctx.db.patch(message._id, {
          readBy: [...message.readBy, userId],
        }),
      ),
    );

    return { updated: unread.length };
  },
});
