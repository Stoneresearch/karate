import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../lib/convex/api';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

// Initialize Convex client for server-side calls
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

async function buffer(readable: any) {
  const chunks = [] as Buffer[];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function addCreditsToUser(userId: string, creditsAmount: number) {
  if (!convexClient) {
    console.warn('Convex not configured - credits not persisted');
    return;
  }

  try {
    // First, get or create user by Clerk ID
    // Note: This assumes userId is a Clerk user ID
    // You may need to create a mapping or use email lookup
    // For now, we'll try to find user by email or create one
    
    // If userId is an email, use it directly
    // Otherwise, you'll need a Clerk ID -> Convex user mapping
    const user = await convexClient.mutation(api.users.getOrCreate, {
      email: userId.includes('@') ? userId : `${userId}@clerk.user`,
      name: 'User',
    });

    if (user?._id) {
      await convexClient.mutation(api.users.addCredits, {
        userId: user._id,
        amount: creditsAmount,
      });
    }
  } catch (error) {
    console.error('Failed to add credits to Convex:', error);
    // Don't throw - webhook should still succeed
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!sig || !whSecret) return res.status(401).end();
  try {
    const buf = await buffer(req);
    const event = stripe.webhooks.constructEvent(buf, sig as string, whSecret);
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.userId as string) || '';
        const creditsAmount = Number(session.metadata?.credits || 0);
        if (userId && creditsAmount > 0) {
          await addCreditsToUser(userId, creditsAmount);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = (invoice.metadata?.userId as string) || '';
        const creditsAmount = Number(invoice.metadata?.credits || 0);
        if (userId && creditsAmount > 0) {
          await addCreditsToUser(userId, creditsAmount);
        }
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (e) {
    console.error('Stripe webhook error:', e);
    return res.status(400).json({ error: 'Invalid signature' });
  }
}


