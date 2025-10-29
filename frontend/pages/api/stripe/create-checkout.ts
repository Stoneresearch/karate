import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

type Body = {
  priceId?: string;
  credits?: number; // optional metadata to add to webhook handling
  quantity?: number; // defaults to 1
  successUrl?: string;
  cancelUrl?: string;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { priceId, credits, quantity, successUrl, cancelUrl } = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as Body;
    if (!priceId) return res.status(400).json({ error: 'priceId required' });

    const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: quantity && quantity > 0 ? quantity : 1 }],
      success_url: successUrl || process.env.STRIPE_SUCCESS_URL || `${origin}/dashboard?purchase=success`,
      cancel_url: cancelUrl || process.env.STRIPE_CANCEL_URL || `${origin}/dashboard?purchase=cancel`,
      metadata: {
        userId,
        ...(credits ? { credits: String(credits) } : {}),
      },
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: 'Failed to create checkout', detail: message });
  }
}


