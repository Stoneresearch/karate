import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Log an agent action (e.g., support response, error event)
export const logAction = mutation({
  args: {
    type: v.string(),     // e.g., "support", "error", "resource"
    action: v.string(),   // e.g., "ticket_response", "error_logged"
    data: v.any(),        // arbitrary payload
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('agents', {
      type: args.type,
      action: args.action,
      data: args.data,
      timestamp: Date.now(),
    });
  },
});

// List actions by type (basic admin feed)
export const list = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let events;
    if (args.type) {
      events = await ctx.db
        .query('agents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .collect();
    } else {
      events = await ctx.db.query('agents').collect();
    }
    return events.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Ticket CRUD for admin/staff/user support workflows
export const createTicket = mutation({
  args: {
    orgId: v.id('organizations'),
    createdBy: v.id('users'),
    title: v.string(),
    description: v.string(),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('tickets', {
      orgId: args.orgId,
      createdBy: args.createdBy,
      assigneeId: undefined,
      status: 'open',
      priority: args.priority ?? 'normal',
      title: args.title,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const assignTicket = mutation({
  args: { id: v.id('tickets'), assigneeId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { assigneeId: args.assigneeId, updatedAt: Date.now() });
    return await ctx.db.get(args.id);
  },
});

export const updateTicketStatus = mutation({
  args: { id: v.id('tickets'), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return await ctx.db.get(args.id);
  },
});

export const addTicketComment = mutation({
  args: { ticketId: v.id('tickets'), authorId: v.id('users'), body: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('ticket_comments', {
      ticketId: args.ticketId,
      authorId: args.authorId,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

export const listTicketsByOrg = query({
  args: { orgId: v.id('organizations'), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let tickets = await ctx.db
      .query('tickets')
      .withIndex('by_org', (q) => q.eq('orgId', args.orgId))
      .collect();
    if (args.status) {
      tickets = tickets.filter((t) => t.status === args.status);
    }
    return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});


