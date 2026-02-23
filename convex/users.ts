import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });

      return existing._id;
    }

    return ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<Doc<"users">[]> => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("clerkId"), args.clerkId))
      .collect();

    return users.sort((a, b) => a.name.localeCompare(b.name));
  },
});
