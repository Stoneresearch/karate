import type { TableId } from './types';
type Ctx = { db: { insert: (t: string, d: unknown) => Promise<unknown> } };
function mutation<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
const v = { string: () => ({}), any: () => ({}), optional: (_: unknown) => ({}), number: () => ({}) };

// Helper to enqueue common marketing jobs
export const scheduleCampaign = mutation<{ audience: unknown; templateId: string; metadata?: unknown }, TableId<'agent_jobs'>>({
  args: { audience: v.any(), templateId: v.string(), metadata: v.optional(v.any()) },
  handler: async (ctx, args) => {
    return (await ctx.db.insert('agent_jobs', {
      type: 'marketing.campaign',
      status: 'queued',
      payload: { audience: args.audience, templateId: args.templateId, metadata: args.metadata || {} },
      priority: 5,
      createdAt: Date.now(),
    })) as unknown as TableId<'agent_jobs'>;
  },
});

export const scheduleChurnCheck = mutation<{ lookbackDays: number }, TableId<'agent_jobs'>>({
  args: { lookbackDays: v.number() },
  handler: async (ctx, args) => {
    return (await ctx.db.insert('agent_jobs', {
      type: 'marketing.churn',
      status: 'queued',
      payload: { lookbackDays: args.lookbackDays },
      priority: 3,
      createdAt: Date.now(),
    })) as unknown as TableId<'agent_jobs'>;
  },
});

export const scheduleWeeklyDigest = mutation<{ audience: unknown }, TableId<'agent_jobs'>>({
  args: { audience: v.any() },
  handler: async (ctx, args) => {
    return (await ctx.db.insert('agent_jobs', {
      type: 'digest.weekly',
      status: 'queued',
      payload: { audience: args.audience },
      priority: 2,
      createdAt: Date.now(),
    })) as unknown as TableId<'agent_jobs'>;
  },
});


