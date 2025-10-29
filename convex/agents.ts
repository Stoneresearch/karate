import type { AgentEvent, Ticket, TicketComment, TableId } from './types';
type Ctx = { db: { query: (t: string) => { collect: () => Promise<unknown[]> }, insert: (t: string, d: unknown) => Promise<unknown>, patch: (id: unknown, d: unknown) => Promise<unknown> } };
function query<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
function mutation<A, R>(def: { args: Record<string, unknown>; handler: (ctx: Ctx, args: A) => Promise<R> | R }) { return def; }
const v = { string: () => ({}), any: () => ({}), optional: (_: unknown) => ({}), id: (_: string) => ({}) };

// Log an agent action (e.g., support response, error event)
export const logAction = mutation({
  args: {
    type: v.string(),     // e.g., "support", "error", "resource"
    action: v.string(),   // e.g., "ticket_response", "error_logged"
    data: v.any(),        // arbitrary payload
  },
  handler: async (ctx, args: { type: string; action: string; data: unknown }) => {
    return (await ctx.db.insert('agents', {
      type: args.type,
      action: args.action,
      data: args.data,
      timestamp: Date.now(),
    })) as unknown as TableId<'agents'>;
  },
});

// List actions by type (basic admin feed)
export const list = query<{ type?: string }, AgentEvent[]>({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('agents').collect();
    const events = all as AgentEvent[];
    if (!args.type) return events.sort((a, b) => b.timestamp - a.timestamp);
    return events.filter((a) => a.type === args.type).sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Ticket CRUD for admin/staff/user support workflows
export const createTicket = mutation<{ orgId: TableId<'organizations'>; createdBy: TableId<'users'>; title: string; description: string; priority?: string }, TableId<'tickets'>>({
  args: {
    orgId: v.any(), // v.id('organizations') when real types are available
    createdBy: v.any(), // v.id('users')
    title: v.string(),
    description: v.string(),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args: { orgId: TableId<'organizations'>; createdBy: TableId<'users'>; title: string; description: string; priority?: string }) => {
    const now = Date.now();
    return (await ctx.db.insert('tickets', {
      orgId: args.orgId,
      createdBy: args.createdBy,
      assigneeId: undefined,
      status: 'open',
      priority: args.priority ?? 'normal',
      title: args.title,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    })) as unknown as TableId<'tickets'>;
  },
});

export const assignTicket = mutation<{ id: TableId<'tickets'>; assigneeId: TableId<'users'> }, Ticket>({
  args: { id: v.any(), assigneeId: v.any() },
  handler: async (ctx, args: { id: TableId<'tickets'>; assigneeId: TableId<'users'> }) => {
    return (await ctx.db.patch(args.id, { assigneeId: args.assigneeId, updatedAt: Date.now() })) as unknown as Ticket;
  },
});

export const updateTicketStatus = mutation<{ id: TableId<'tickets'>; status: 'open' | 'in_progress' | 'closed' }, Ticket>({
  args: { id: v.any(), status: v.string() },
  handler: async (ctx, args: { id: TableId<'tickets'>; status: 'open' | 'in_progress' | 'closed' }) => {
    return (await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() })) as unknown as Ticket;
  },
});

export const addTicketComment = mutation<{ ticketId: TableId<'tickets'>; authorId: TableId<'users'>; body: string }, TableId<'ticket_comments'>>({
  args: { ticketId: v.any(), authorId: v.any(), body: v.string() },
  handler: async (ctx, args: { ticketId: TableId<'tickets'>; authorId: TableId<'users'>; body: string }) => {
    return (await ctx.db.insert('ticket_comments', {
      ticketId: args.ticketId,
      authorId: args.authorId,
      body: args.body,
      createdAt: Date.now(),
    })) as unknown as TableId<'ticket_comments'>;
  },
});

export const listTicketsByOrg = query<{ orgId: TableId<'organizations'>; status?: string }, Ticket[]>({
  args: { orgId: v.any(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('tickets').collect();
    const filtered = (all as Ticket[]).filter((t) => String(t.orgId) === String(args.orgId));
    const byStatus = args.status ? filtered.filter((t) => t.status === args.status) : filtered;
    return byStatus.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});


