import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { Workflow, FlowNode, FlowEdge } from './types';

export const get = query({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get or create workflow (mutation version for creating)
export const getOrCreate = mutation({
  args: { id: v.optional(v.id('workflows')), title: v.optional(v.string()), owner: v.string() },
  handler: async (ctx, args) => {
    if (args.id) {
      const workflow = await ctx.db.get(args.id);
      if (workflow) return workflow._id;
    }
    // Create new workflow if doesn't exist
    return await ctx.db.insert('workflows', {
      title: args.title || 'My First Flow',
      nodes: [],
      edges: [],
      owner: args.owner,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    id: v.id('workflows'),
    title: v.optional(v.string()),
    nodes: v.optional(v.any()),
    edges: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.id);
    if (!workflow) {
      throw new Error(`Workflow ${args.id} not found`);
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
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workflows')
      .withIndex('by_owner', (q) => q.eq('owner', args.owner))
      .collect();
  },
});

export const deleteWorkflow = mutation({
  args: { id: v.id('workflows') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});


