import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

// Simple in-memory credits store for dev; replace with Convex mutation in prod
const credits: Map<string, number> = new Map();
function addCredits(userId: string, amount: number) {
  credits.set(userId, (credits.get(userId) || 0) + amount);
}

async function buffer(readable: any) {
  const chunks = [] as Buffer[];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
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
        if (userId && creditsAmount > 0) addCredits(userId, creditsAmount);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = (invoice.metadata?.userId as string) || '';
        const creditsAmount = Number(invoice.metadata?.credits || 0);
        if (userId && creditsAmount > 0) addCredits(userId, creditsAmount);
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
}


