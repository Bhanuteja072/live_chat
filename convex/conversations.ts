import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

interface ConversationSummary {
  _id: Id<"conversations">;
  otherUser: {
    clerkId: string;
    name: string;
    imageUrl: string;
    isOnline?: boolean;
  };
  lastMessagePreview?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export const getOrCreate = mutation({
  args: { otherUserClerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const myClerkId = identity.subject;

    const matchesFromParticipantOne = await ctx.db
      .query("conversations")
      .withIndex("by_participant_one", (q) => q.eq("participantOne", myClerkId))
      .filter((q) => q.eq(q.field("participantTwo"), args.otherUserClerkId))
      .collect();

    const matchesFromParticipantTwo = await ctx.db
      .query("conversations")
      .withIndex("by_participant_two", (q) => q.eq("participantTwo", myClerkId))
      .filter((q) => q.eq(q.field("participantOne"), args.otherUserClerkId))
      .collect();

    const existing = [...matchesFromParticipantOne, ...matchesFromParticipantTwo][0];
    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("conversations", {
      participantOne: myClerkId,
      participantTwo: args.otherUserClerkId,
      createdAt: Date.now(),
    });
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx): Promise<ConversationSummary[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const myClerkId = identity.subject;

    const participantOneConvos = await ctx.db
      .query("conversations")
      .withIndex("by_participant_one", (q) => q.eq("participantOne", myClerkId))
      .collect();

    const participantTwoConvos = await ctx.db
      .query("conversations")
      .withIndex("by_participant_two", (q) => q.eq("participantTwo", myClerkId))
      .collect();

    const allConversations = [...participantOneConvos, ...participantTwoConvos].sort(
      (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
    );

    const summaries = await Promise.all(
      allConversations.map(async (conversation) => {
        const otherClerkId =
          conversation.participantOne === myClerkId
            ? conversation.participantTwo
            : conversation.participantOne;

        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", otherClerkId))
          .unique();

        const membership = await ctx.db
          .query("conversationMembers")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", myClerkId).eq("conversationId", conversation._id)
          )
          .unique();

        const messagesQuery = ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          );

        const unreadMessages = membership
          ? await messagesQuery
              .filter((q) => q.gt(q.field("createdAt"), membership.lastReadTime))
              .filter((q) => q.neq(q.field("senderId"), myClerkId))
              .collect()
          : await messagesQuery
              .filter((q) => q.neq(q.field("senderId"), myClerkId))
              .collect();

        return {
          _id: conversation._id,
          otherUser: {
            clerkId: otherClerkId,
            name: otherUser?.name ?? "Unknown",
            imageUrl: otherUser?.imageUrl ?? "",
            isOnline: otherUser?.isOnline,
          },
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageTime: conversation.lastMessageTime,
          unreadCount: unreadMessages.length,
        } satisfies ConversationSummary;
      })
    );

    return summaries;
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const existing = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
      return;
    }

    await ctx.db.insert("conversationMembers", {
      conversationId: args.conversationId,
      userId,
      lastReadTime: Date.now(),
    });
  },
});

export const getUnreadCount = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args): Promise<number> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const userId = identity.subject;
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .unique();

    const messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId));

    const unreadMessages = membership
      ? await messagesQuery
          .filter((q) => q.gt(q.field("createdAt"), membership.lastReadTime))
          .filter((q) => q.neq(q.field("senderId"), userId))
          .collect()
      : await messagesQuery
          .filter((q) => q.neq(q.field("senderId"), userId))
          .collect();

    return unreadMessages.length;
  },
});
