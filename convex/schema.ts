// Temporary shims for Convex types to satisfy TypeScript until `npx convex dev` is run.
// Replace with real imports once Convex is configured:
// import { defineSchema, defineTable } from 'convex/server';
// import { v } from 'convex/values';
const defineSchema = (schema: any) => schema;
const defineTable = (shape: any) => ({ index: (_: string, __: string[]) => ({}) });
const v = {
  string: () => ({}),
  boolean: () => ({}),
  number: () => ({}),
  any: () => ({}),
  array: (inner: any) => ({}),
  optional: (inner: any) => ({}),
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
});


