import type { AgentJob, AgentJobStatus, TableId } from './types';
type Ctx = { db: { query: (t: string) => { collect: () => Promise<unknown[]> }, insert: (t: string, d: unknown) => Promise<unknown>, patch: (id: unknown, d: unknown) => Promise<unknown> } };
function query<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
function mutation<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
const v = { string: () => ({}), any: () => ({}), optional: (_: unknown) => ({}), number: () => ({}), id: (_: string) => ({}) };

export const enqueue = mutation<{ type: string; payload: unknown; priority?: number }, TableId<'agent_jobs'>>({
  args: { type: v.string(), payload: v.any(), priority: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return (await ctx.db.insert('agent_jobs', {
      type: args.type,
      status: 'queued' as AgentJobStatus,
      payload: args.payload,
      priority: args.priority ?? 0,
      createdAt: Date.now(),
    })) as unknown as TableId<'agent_jobs'>;
  },
});

export const claimNext = mutation<{ type?: string; userId?: TableId<'users'> }, AgentJob | null>({
  args: { type: v.optional(v.string()), userId: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('agent_jobs').collect();
    const candidates = (all as AgentJob[])
      .filter((j) => j.status === 'queued' && (!args.type || j.type === args.type))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.createdAt - b.createdAt);
    const job = candidates[0];
    if (!job || !('_id' in job) || !job._id) return null;
    await ctx.db.patch(job._id as unknown, { status: 'claimed', claimedAt: Date.now(), claimedBy: args.userId });
    return { ...job, status: 'claimed', claimedAt: Date.now(), claimedBy: args.userId } as AgentJob;
  },
});

export const complete = mutation<{ id: TableId<'agent_jobs'>; result?: unknown }, AgentJob>({
  args: { id: v.any(), result: v.optional(v.any()) },
  handler: async (ctx, args) => {
    return (await ctx.db.patch(args.id, { status: 'completed', result: args.result, completedAt: Date.now() })) as unknown as AgentJob;
  },
});

export const fail = mutation<{ id: TableId<'agent_jobs'>; error: string }, AgentJob>({
  args: { id: v.any(), error: v.string() },
  handler: async (ctx, args) => {
    return (await ctx.db.patch(args.id, { status: 'failed', error: args.error, completedAt: Date.now() })) as unknown as AgentJob;
  },
});

export const list = query<{ status?: AgentJobStatus; type?: string }, AgentJob[]>({
  args: { status: v.optional(v.string()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('agent_jobs').collect();
    return (all as AgentJob[])
      .filter((j) => (!args.status || j.status === args.status) && (!args.type || j.type === args.type))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});


