import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

interface ConversationSummary {
  _id: Id<"conversations">;
  otherUser: {
    clerkId: string;
    name: string;
    imageUrl: string;
  };
  lastMessagePreview?: string;
  lastMessageTime?: number;
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

        return {
          _id: conversation._id,
          otherUser: {
            clerkId: otherClerkId,
            name: otherUser?.name ?? "Unknown",
            imageUrl: otherUser?.imageUrl ?? "",
          },
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageTime: conversation.lastMessageTime,
        } satisfies ConversationSummary;
      })
    );

    return summaries;
  },
});
