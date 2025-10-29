import type { Run, RunStatus, TableId } from './types';
type Ctx = { db: { query: (table: string) => { collect: () => Promise<unknown[]> }, insert: (table: string, doc: unknown) => Promise<unknown>, patch: (id: unknown, doc: unknown) => Promise<unknown> } };
function query<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
function mutation<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
const v = { string: () => ({}), any: () => ({}), optional: (_: unknown) => ({}), id: (_: string) => ({}) };

export const create = mutation<{ workflowId: TableId<'workflows'>; userId: TableId<'users'>; input?: unknown }, TableId<'runs'>>({
  args: {
    workflowId: v.any(),
    userId: v.any(),
    input: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return (await ctx.db.insert('runs', {
      workflowId: args.workflowId,
      userId: args.userId,
      status: 'queued' as RunStatus,
      result: { input: args.input ?? null },
      startedAt: now,
      completedAt: undefined,
    })) as unknown as TableId<'runs'>;
  },
});

export const updateStatus = mutation<{ id: TableId<'runs'>; status: RunStatus; result?: unknown }, Run>({
  args: { id: v.any(), status: v.string(), result: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const patch: Partial<Run> = { status: args.status } as Partial<Run>;
    if (args.result !== undefined) (patch as Partial<Run>).result = args.result;
    if (args.status === 'completed' || args.status === 'failed') {
      patch.completedAt = Date.now();
    }
    return (await ctx.db.patch(args.id, patch)) as unknown as Run;
  },
});

export const listByWorkflow = query<{ workflowId: TableId<'workflows'> }, Run[]>({
  args: { workflowId: v.any() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('runs').collect();
    return (all as Run[])
      .filter((r) => String(r.workflowId) === String(args.workflowId))
      .sort((a, b) => b.startedAt - a.startedAt);
  },
});


