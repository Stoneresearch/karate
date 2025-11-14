import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const create = mutation({
  args: {
    workflowId: v.id('workflows'),
    userId: v.id('users'),
    input: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('runs', {
      workflowId: args.workflowId,
      userId: args.userId,
      status: 'queued',
      result: { input: args.input ?? null },
      startedAt: now,
      completedAt: undefined,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id('runs'), status: v.string(), result: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const patch: { status: string; result?: unknown; completedAt?: number } = { status: args.status };
    if (args.result !== undefined) patch.result = args.result;
    if (args.status === 'completed' || args.status === 'failed') {
      patch.completedAt = Date.now();
    }
    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

export const listByWorkflow = query({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('runs')
      .withIndex('by_workflow', (q) => q.eq('workflowId', args.workflowId))
      .collect()
      .then(runs => runs.sort((a, b) => b.startedAt - a.startedAt));
  },
});


