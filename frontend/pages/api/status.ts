import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../lib/convex/api';
import type { Id } from '../../lib/convex/dataModel';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { taskId, runId } = req.query;

  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'taskId required' });
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const internalKey = process.env.INTERNAL_API_KEY || '';

  try {
    const response = await fetch(`${backendUrl}/api/v1/ai/status/${taskId}`, {
      headers: { 'x-api-key': internalKey } as Record<string, string>,
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to check status' });
    }

    const data = await response.json();

    // If we have a runId and the task is done/failed, update Convex
    if (convexClient && runId && typeof runId === 'string') {
        // We only update if we haven't already (client might poll multiple times)
        // But Convex mutations are idempotent-ish for status updates usually.
        if (data.status === 'completed') {
             const outputUrl = data.output_url || data.url;
             await convexClient.mutation(api.runs.updateStatus, {
                id: runId as Id<'runs'>,
                status: 'completed',
                result: { output_url: outputUrl },
            });
        } else if (data.status === 'failed') {
            await convexClient.mutation(api.runs.updateStatus, {
                id: runId as Id<'runs'>,
                status: 'failed',
                error: data.error || 'Unknown error',
            });
        }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Status check failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

