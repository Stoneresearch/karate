import { query } from './_generated/server';

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) return [];

    return await ctx.db
      .query('transactions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(100);
  },
});

