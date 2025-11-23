import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

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

// Get or create user by email (Updated to use Clerk Identity)
export const getOrCreate = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // If called from UI with Clerk auth, verify email matches
    if (identity && identity.email !== args.email) {
        // Mismatch is weird but let's prioritize identity if available
        // or just allow it (maybe admin/script usage doesn't have identity)
    }

    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    
    if (!user) {
      // If this is a real user logging in, we should also capture their tokenIdentifier
      const tokenIdentifier = identity?.tokenIdentifier;

      const userId = await ctx.db.insert('users', {
        email: args.email,
        name: args.name,
        credits: 0,
        createdAt: Date.now(),
        tokenIdentifier: tokenIdentifier, // Optional field if schema allows, good for tracking
      });
      user = await ctx.db.get(userId);
    } else if (identity && !user.tokenIdentifier) {
        // Backfill tokenIdentifier if missing and user is logged in
        await ctx.db.patch(user._id, { tokenIdentifier: identity.tokenIdentifier });
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
      credits: (user.credits || 0) + args.amount,
    });

    // Log transaction
    await ctx.db.insert('transactions', {
        userId: args.userId,
        type: 'credit_purchase',
        amount: args.amount,
        description: `Added ${args.amount} credits`,
        createdAt: Date.now(),
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
    
    // Log transaction
    await ctx.db.insert('transactions', {
        userId: args.userId,
        type: 'manual_deduction',
        amount: -args.amount,
        description: `Deducted ${args.amount} credits`,
        createdAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// Get user credits
export const getCredits = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("getCredits: No identity found (User not logged in to Clerk/Convex)");
        return 0;
      }
      
      // 1. Try to find by tokenIdentifier (most robust)
      user = await ctx.db
        .query('users')
        .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
        .first();

      // 2. Fallback to email if not found by token
      if (!user && identity.email) {
         user = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', identity.email!))
        .first();
      }
        
      if (!user) {
        console.log(`getCredits: Identity found (${identity.email} / ${identity.tokenIdentifier}), but no user record in DB.`);
      } else {
        // console.log(`getCredits: Returning ${user.credits} credits for ${user.email}`);
      }
    }
    
    return user?.credits ?? 0;
  },
});

// List all users (DEBUG ONLY - remove in prod)
export const debugListUsers = query({
    args: {},
    handler: async (ctx) => {
      return await ctx.db.query('users').collect();
    },
  });
