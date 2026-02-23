import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]), // Unique index keeps one row per Clerk user.
  conversations: defineTable({
    participantOne: v.string(),
    participantTwo: v.string(),
    lastMessagePreview: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_participant_one", ["participantOne"])
    .index("by_participant_two", ["participantTwo"]),
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
});
