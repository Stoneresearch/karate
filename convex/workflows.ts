import type { Workflow, FlowNode, FlowEdge, TableId } from './types';
type Ctx = { db: { query: (table: string) => { collect: () => Promise<unknown[]> }, insert: (table: string, doc: unknown) => Promise<unknown>, patch: (id: unknown, doc: unknown) => Promise<unknown>, delete: (id: unknown) => Promise<void> } };
function query<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
function mutation<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
const v = { string: () => ({}), boolean: () => ({}), number: () => ({}), any: () => ({}), array: (_: unknown) => ({}), optional: (_: unknown) => ({}), id: (_: string) => ({}) };

export const get = query<{ id: string }, Workflow>({
  args: { id: v.string() },
  handler: async (ctx, _args) => {
    const workflows = await ctx.db.query('workflows').collect();
    const fallback: Workflow = {
      title: 'My First Flow',
      nodes: [],
      edges: [],
      owner: 'demo-user',
      isPublic: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return (workflows[0] as Workflow) || fallback;
  },
});

export const create = mutation<{ title: string; owner: string }, TableId<'workflows'>>({
  args: {
    title: v.string(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return (await ctx.db.insert('workflows', {
      title: args.title,
      nodes: [],
      edges: [],
      owner: args.owner,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })) as unknown as TableId<'workflows'>;
  },
});

export const update = mutation<{ id: TableId<'workflows'>; title?: string; nodes?: FlowNode[]; edges?: FlowEdge[] }, Workflow>({
  args: {
    id: v.id('workflows'),
    title: v.optional(v.string()),
    nodes: v.optional(v.array(v.any())),
    edges: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query('workflows')
      .collect();
    if (workflows.length === 0) {
      return (await ctx.db.insert('workflows', {
        title: args.title || 'My First Flow',
        nodes: args.nodes || [],
        edges: args.edges || [],
        owner: 'demo-user',
        isPublic: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })) as unknown as Workflow;
    }
    const workflow = workflows[0] as Workflow;
    return (await ctx.db.patch((workflow as Workflow)._id as unknown, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.nodes !== undefined ? { nodes: args.nodes } : {}),
      ...(args.edges !== undefined ? { edges: args.edges } : {}),
      updatedAt: Date.now(),
    })) as unknown as Workflow;
  },
});

export const list = query<{ owner: string }, Workflow[]>({
  args: { owner: v.string() },
  handler: async (ctx, _args) => {
    const all = await ctx.db.query('workflows').collect();
    return all as Workflow[];
  },
});

export const deleteWorkflow = mutation<{ id: TableId<'workflows'> }, void>({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});


