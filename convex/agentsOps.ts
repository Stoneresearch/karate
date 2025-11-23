import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const enqueue = mutation({
  args: { type: v.string(), payload: v.any(), priority: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert('agent_jobs', {
      type: args.type,
      status: 'queued',
      payload: args.payload,
      priority: args.priority ?? 0,
      createdAt: Date.now(),
    });
  },
});

export const claimNext = mutation({
  args: { type: v.optional(v.string()), userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    let candidates = await ctx.db
      .query('agent_jobs')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .collect();
    
    if (args.type) {
      candidates = candidates.filter((j) => j.type === args.type);
    }
    
    candidates.sort(
      (a, b) =>
        (b.priority ?? 0) - (a.priority ?? 0) || a.createdAt - b.createdAt
    );
    const job = candidates[0];
    if (!job) return null;
    
    await ctx.db.patch(job._id, { 
      status: 'claimed', 
      claimedAt: Date.now(), 
      claimedBy: args.userId 
    });
    return await ctx.db.get(job._id);
  },
});

export const complete = mutation({
  args: { id: v.id('agent_jobs'), result: v.optional(v.any()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: 'completed', 
      result: args.result, 
      completedAt: Date.now() 
    });
    return await ctx.db.get(args.id);
  },
});

export const fail = mutation({
  args: { id: v.id('agent_jobs'), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: 'failed', 
      error: args.error, 
      completedAt: Date.now() 
    });
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { status: v.optional(v.string()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let jobs;
    if (args.status) {
      jobs = await ctx.db
        .query('agent_jobs')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else {
      jobs = await ctx.db.query('agent_jobs').collect();
    }
    
    if (args.type) {
      jobs = jobs.filter((j) => j.type === args.type);
    }
    
    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});


