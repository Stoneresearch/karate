import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../lib/convex/api';

type RunRequestBody = { model: string; prompt: string; workflowId?: string };
type RunResponse = { task_id?: string; run_id?: string; model?: string; prompt?: string; output_url?: string; url?: string; error?: string; detail?: unknown };

// Initialize Convex client for server-side calls
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse<RunResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { model, prompt, workflowId } = (req.body || {}) as RunRequestBody;
    if (!model || !prompt) return res.status(400).json({ error: 'model and prompt required' });

    // Get or create user in Convex
    let convexUserId: string | null = null;
    if (convexClient) {
      try {
        // Try to get user by email (assuming Clerk email)
        // In production, you'd have a Clerk ID -> Convex user mapping
        const user = await convexClient.mutation(api.users.getOrCreate, {
          email: userId.includes('@') ? userId : `${userId}@clerk.user`,
          name: 'User',
        });
        convexUserId = user?._id || null;
      } catch (error) {
        console.error('Failed to get/create user:', error);
      }
    }

    // Create run record in Convex if we have workflowId and userId
    let runId: string | null = null;
    if (convexClient && workflowId && convexUserId) {
      try {
        runId = await convexClient.mutation(api.runs.create, {
          workflowId: workflowId as any,
          userId: convexUserId as any,
          input: { model, prompt },
        });
      } catch (error) {
        console.error('Failed to create run record:', error);
      }
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const internalKey = process.env.INTERNAL_API_KEY || '';
    const response = await fetch(`${backendUrl}/api/v1/ai/infer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': internalKey,
        'x-user-id': userId,
      } as Record<string, string>,
      body: JSON.stringify({ model, prompt }),
    });
    const data = (await response.json()) as RunResponse;

    // Update run status if we created a run record
    const outputUrl = data.output_url || data.url;
    if (convexClient && runId && outputUrl) {
      try {
        await convexClient.mutation(api.runs.updateStatus, {
          id: runId as any,
          status: 'completed',
          result: { output_url: outputUrl },
        });
      } catch (error) {
        console.error('Failed to update run status:', error);
      }
    }

    return res.status(response.status).json({ ...data, run_id: runId || undefined });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: 'Failed to start run', detail: message });
  }
}


