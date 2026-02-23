import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

interface MessageWithSender {
  _id: Id<"messages">;
  content: string;
  senderId: string;
  createdAt: number;
  senderName: string;
  senderImageUrl: string;
}

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const senderId = identity.subject;
    const createdAt = Date.now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId,
      content: args.content,
      createdAt,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessagePreview: args.content.slice(0, 50),
      lastMessageTime: createdAt,
    });
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args): Promise<MessageWithSender[]> => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", message.senderId))
          .unique();

        return {
          _id: message._id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
          senderName: sender?.name ?? "Unknown",
          senderImageUrl: sender?.imageUrl ?? "",
        } satisfies MessageWithSender;
      })
    );

    return enriched;
  },
});
