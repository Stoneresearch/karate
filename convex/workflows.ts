// Temporary type-only shims to satisfy TypeScript without generated Convex types.
// When Convex is configured, replace with: `import { query, mutation } from './_generated/server'`.
// And remove the below minimal shims.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Ctx = { db: any };
function query<T>(def: { args: any; handler: (ctx: Ctx, args: any) => Promise<T> | T }) { return def as any; }
function mutation<T>(def: { args: any; handler: (ctx: Ctx, args: any) => Promise<T> | T }) { return def as any; }
// Lightweight validator shim compatible with existing callsites
const v = {
  string: () => ({}),
  boolean: () => ({}),
  number: () => ({}),
  any: () => ({}),
  array: (inner: any) => ({}),
  optional: (inner: any) => ({}),
  id: (_: string) => ({}),
};

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query('workflows')
      .collect();
    return workflows[0] || {
      id: 'demo-room',
      title: 'My First Flow',
      nodes: [],
      edges: [],
      owner: 'demo-user',
      isPublic: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('workflows', {
      title: args.title,
      nodes: [],
      edges: [],
      owner: args.owner,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.any(),
    title: v.optional(v.string()),
    nodes: v.optional(v.array(v.any())),
    edges: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query('workflows')
      .collect();
    if (workflows.length === 0) {
      return await ctx.db.insert('workflows', {
        title: args.title || 'My First Flow',
        nodes: args.nodes || [],
        edges: args.edges || [],
        owner: 'demo-user',
        isPublic: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    const workflow = workflows[0];
    return await ctx.db.patch(workflow._id, {
      ...(args.title && { title: args.title }),
      ...(args.nodes && { nodes: args.nodes }),
      ...(args.edges && { edges: args.edges }),
      updatedAt: Date.now(),
    });
  },
});

export const list = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workflows')
      .filter((q) => q.eq(q.field('owner'), args.owner))
      .collect();
  },
});

export const deleteWorkflow = mutation({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});


