import { mutation, internalMutation, query } from './_generated/server';
import { v } from 'convex/values';

export const registerFile = mutation({
  args: {
    storageId: v.string(),
    type: v.optional(v.string()),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("files", {
      storageId: args.storageId,
      type: args.type,
      size: args.size,
      createdAt: Date.now(),
      userId: user._id,
    });
  },
});

export const listUserFiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

// Internal mutation to be called by Cron
export const clearOldFiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    const oldFiles = await ctx.db
      .query("files")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", oneHourAgo))
      .take(20); // Process in batches to avoid timeouts

    for (const file of oldFiles) {
      try {
        await ctx.storage.delete(file.storageId);
        await ctx.db.delete(file._id);
      } catch (e) {
        console.error(`Failed to delete file ${file._id}:`, e);
      }
    }
  },
});
