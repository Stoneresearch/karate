// Temporary shims for Convex types to satisfy TypeScript until `npx convex dev` is run.
// Replace with real imports once Convex is configured:
// import { defineSchema, defineTable } from 'convex/server';
// import { v } from 'convex/values';
const defineSchema = (schema: unknown) => schema;
const defineTable = (shape: unknown) => ({ index: (_: string, __: string[]) => ({}) });
const v = {
  string: () => ({}),
  boolean: () => ({}),
  number: () => ({}),
  any: () => ({}),
  array: (_inner: unknown) => ({}),
  optional: (_inner: unknown) => ({}),
  id: (_: string) => ({}),
};

export default defineSchema({
  workflows: defineTable({
    title: v.string(),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
    owner: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_owner', ['owner']),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  // Organizations and memberships (roles: admin, staff, user)
  organizations: defineTable({
    name: v.string(),
    ownerId: v.optional(v.id('users')),
    createdAt: v.number(),
  }).index('by_owner', ['ownerId']),

  memberships: defineTable({
    orgId: v.id('organizations'),
    userId: v.id('users'),
    role: v.string(), // 'admin' | 'staff' | 'user'
    createdAt: v.number(),
  })
    .index('by_org', ['orgId'])
    .index('by_user', ['userId']),

  agents: defineTable({
    type: v.string(),
    action: v.string(),
    data: v.any(),
    timestamp: v.number(),
  }).index('by_type', ['type']),

  runs: defineTable({
    workflowId: v.id('workflows'),
    userId: v.id('users'),
    status: v.string(),
    result: v.any(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index('by_workflow', ['workflowId']),

  // Simple ticketing to support admin/staff workflows
  tickets: defineTable({
    orgId: v.id('organizations'),
    createdBy: v.id('users'),
    assigneeId: v.optional(v.id('users')),
    status: v.string(), // 'open' | 'in_progress' | 'closed'
    priority: v.optional(v.string()), // 'low' | 'normal' | 'high' (free-form)
    title: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org', ['orgId'])
    .index('by_status', ['status']),

  ticket_comments: defineTable({
    ticketId: v.id('tickets'),
    authorId: v.id('users'),
    body: v.string(),
    createdAt: v.number(),
  }).index('by_ticket', ['ticketId']),

  // Agent job queue for internal agents (e.g., marketing manager)
  agent_jobs: defineTable({
    type: v.string(), // e.g., 'marketing.campaign', 'marketing.churn', 'digest.weekly'
    status: v.string(), // queued | claimed | completed | failed
    payload: v.any(),
    createdAt: v.number(),
    claimedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    claimedBy: v.optional(v.id('users')),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    priority: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_type', ['type'])
    .index('by_createdAt', ['createdAt']),
});


