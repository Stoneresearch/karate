import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type RunRequestBody = { model: string; prompt: string };
type RunResponse = { task_id?: string; model?: string; prompt?: string; error?: string; detail?: unknown };

export default async function handler(req: NextApiRequest, res: NextApiResponse<RunResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { model, prompt } = (req.body || {}) as RunRequestBody;
    if (!model || !prompt) return res.status(400).json({ error: 'model and prompt required' });

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
    return res.status(response.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: 'Failed to start run', detail: message });
  }
}


