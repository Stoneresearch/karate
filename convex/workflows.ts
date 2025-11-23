import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { id: v.id('workflows') },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.get(args.id);
  },
});

// Get or create workflow (mutation version for creating)
export const getOrCreate = mutation({
  args: { id: v.optional(v.id('workflows')), title: v.optional(v.string()), owner: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const ownerId = identity.tokenIdentifier;
    const targetTitle = args.title || 'My First Flow';

    if (args.id) {
      const workflow = await ctx.db.get(args.id);
      if (workflow) {
          // Check ownership?
          // if (workflow.owner !== ownerId) throw new Error("Unauthorized access to workflow");
          return workflow._id;
      }
    }

    // Check if a workflow with this title already exists for this user
    // This prevents duplicate "My First Flow" creation on every login/refresh
    const existing = await ctx.db
      .query('workflows')
      .withIndex('by_owner', (q: any) => q.eq('owner', ownerId))
      .filter((q: any) => q.eq(q.field("title"), targetTitle))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new workflow if doesn't exist
    return await ctx.db.insert('workflows', {
      title: targetTitle,
      nodes: [],
      edges: [],
      owner: ownerId,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    owner: v.optional(v.string()), // make optional, derive from auth
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    return await ctx.db.insert('workflows', {
      title: args.title,
      nodes: [],
      edges: [],
      owner: identity.tokenIdentifier,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('workflows'),
    title: v.optional(v.string()),
    nodes: v.optional(v.any()),
    edges: v.optional(v.any()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const workflow = await ctx.db.get(args.id);
    if (!workflow) {
      throw new Error(`Workflow ${args.id} not found`);
    }
    
    // Verify ownership if authenticated
    if (!identity || identity.tokenIdentifier !== workflow.owner) {
      throw new Error("Unauthorized to update this workflow");
    }
    
    await ctx.db.patch(args.id, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.nodes !== undefined ? { nodes: args.nodes } : {}),
      ...(args.edges !== undefined ? { edges: args.edges } : {}),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { owner: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    let owner = args.owner;
    
    if (identity) {
        owner = identity.tokenIdentifier;
    } else if (!owner) {
        // If not logged in and no owner specified, return empty or demo?
        // Safe default: return empty
        return [];
    }

    return await ctx.db
      .query('workflows')
      // Explicitly type index query param to avoid implicit any while Convex types are stubbed
      .withIndex('by_owner', (q: any) => q.eq('owner', owner))
      .collect();
  },
});

export const deleteWorkflow = mutation({
  args: { id: v.id('workflows') },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const workflow = await ctx.db.get(args.id);
    
    if (!workflow) return; // Already gone
    
    if (!identity || identity.tokenIdentifier !== workflow.owner) {
      throw new Error("Unauthorized to delete this workflow");
    }
    
    await ctx.db.delete(args.id);
  },
});

export const deleteBatch = mutation({
  args: { ids: v.array(v.id('workflows')) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();

    for (const id of args.ids) {
      const workflow = await ctx.db.get(id);
      if (!workflow) continue;
      
    if (!identity || identity.tokenIdentifier !== workflow.owner) {
        // Skip unauthorized
        continue;
    }
      await ctx.db.delete(id);
    }
  },
});


