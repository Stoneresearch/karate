import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

// Get user by email (for Clerk integration)
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

// Get or create user by email
export const getOrCreate = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    
    if (!user) {
      const userId = await ctx.db.insert('users', {
        email: args.email,
        name: args.name,
        credits: 0,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }
    
    return user;
  },
});

// Add credits to user
export const addCredits = mutation({
  args: { userId: v.id('users'), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');
    
    await ctx.db.patch(args.userId, {
      credits: user.credits + args.amount,
    });
    
    return await ctx.db.get(args.userId);
  },
});

// Deduct credits from user
export const deductCredits = mutation({
  args: { userId: v.id('users'), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');
    
    if (user.credits < args.amount) {
      throw new Error('Insufficient credits');
    }
    
    await ctx.db.patch(args.userId, {
      credits: user.credits - args.amount,
    });
    
    return await ctx.db.get(args.userId);
  },
});

// Get user credits
export const getCredits = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.credits ?? 0;
  },
});

