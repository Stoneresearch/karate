import { mutation } from './_generated/server';

export const nuke = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      'users',
      'workflows',
      'organizations',
      'memberships',
      'agents',
      'runs',
      'transactions',
      'tickets',
      'ticket_comments',
      'agent_jobs',
    ];

    let count = 0;
    for (const table of tables) {
      // @ts-ignore
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        count++;
      }
    }
    return `Deleted ${count} records across all tables.`;
  },
});

