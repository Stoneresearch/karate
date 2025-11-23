import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const create = mutation({
  args: {
    workflowId: v.optional(v.id('workflows')),
    userId: v.id('users'),
    input: v.optional(v.any()),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Transactionally deduct credits if cost > 0
    const cost = args.cost ?? 0;
    if (cost > 0) {
      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error('User not found');
      
      if ((user.credits || 0) < cost) {
        // Should generally be caught before run, but double check here
        throw new Error(`Insufficient credits. Need ${cost}, have ${user.credits}`);
      }
      
      await ctx.db.patch(args.userId, {
        credits: (user.credits || 0) - cost,
      });
      
      // Log transaction
      await ctx.db.insert('transactions', {
        userId: args.userId,
        type: 'run_cost',
        amount: -cost,
        referenceId: args.workflowId ?? undefined, 
        description: args.workflowId ? `Run workflow ${args.workflowId}` : 'Run standalone',
        createdAt: now,
      });
    }
    
    const runId = await ctx.db.insert('runs', {
      workflowId: args.workflowId,
      userId: args.userId,
      status: 'queued',
      result: { input: args.input ?? null },
      startedAt: now,
      completedAt: undefined,
      cost: cost,
    });
    
    // Update transaction reference if needed (optional cleanup)
    // Not strictly necessary since we logged referenceId above as workflowId, 
    // but could be runId if preferred.
    
    return runId;
  },
});

export const updateStatus = mutation({
  args: { 
    id: v.id('runs'), 
    status: v.string(), 
    result: v.optional(v.any()),
    error: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const patch: { status: string; result?: unknown; completedAt?: number } = { status: args.status };
    if (args.result !== undefined) patch.result = args.result;
    
    // If error occurs, we might want to refund? 
    // For now, simple status update.
    if (args.status === 'completed' || args.status === 'failed') {
      patch.completedAt = Date.now();
    }
    
    await ctx.db.patch(args.id, patch);
    return await ctx.db.get(args.id);
  },
});

export const listByWorkflow = query({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args: { workflowId: Id<'workflows'> }) => {
    return await ctx.db
      .query('runs')
      .withIndex('by_workflow', (q) => q.eq('workflowId', args.workflowId))
      .order('desc')
      .take(50);
  },
});
