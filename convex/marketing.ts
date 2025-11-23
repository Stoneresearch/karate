import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Helper to enqueue common marketing jobs
export const scheduleCampaign = mutation({
  args: { audience: v.any(), templateId: v.string(), metadata: v.optional(v.any()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert('agent_jobs', {
      type: 'marketing.campaign',
      status: 'queued',
      payload: { audience: args.audience, templateId: args.templateId, metadata: args.metadata || {} },
      priority: 5,
      createdAt: Date.now(),
    });
  },
});

export const scheduleChurnCheck = mutation({
  args: { lookbackDays: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('agent_jobs', {
      type: 'marketing.churn',
      status: 'queued',
      payload: { lookbackDays: args.lookbackDays },
      priority: 3,
      createdAt: Date.now(),
    });
  },
});

export const scheduleWeeklyDigest = mutation({
  args: { audience: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('agent_jobs', {
      type: 'digest.weekly',
      status: 'queued',
      payload: { audience: args.audience },
      priority: 2,
      createdAt: Date.now(),
    });
  },
});


