import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../lib/convex/api';
import type { Id } from '../../lib/convex/dataModel';

type RunRequestBody = { 
  model: string; 
  prompt: string; 
  workflowId?: string;
  aspect_ratio?: string;
  guidance_scale?: number;
  output_format?: string;
  safety_tolerance?: number;
  seed?: number;
};
type RunResponse = { 
    task_id?: string; 
    run_id?: string; 
    model?: string; 
    prompt?: string; 
    output_url?: string; 
    url?: string; 
    status?: string;
    error?: string; 
    detail?: unknown 
};

// Fallback costs if backend is unreachable.
const FALLBACK_COSTS: Record<string, number> = {
  "stable-diffusion-3.5": 1,
  "dalle-3": 2,
  "gpt-image-1": 2,
  "flux-pro-1.1": 2,
  "veo-3": 3,
  "sora-2": 4,
};

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
    const { model, prompt, workflowId: rawWorkflowId, aspect_ratio, guidance_scale, output_format, safety_tolerance, seed, email } = (req.body || {}) as RunRequestBody & { email?: string };
    if (!model || !prompt) return res.status(400).json({ error: 'model and prompt required' });

    // Validate workflowId: ignore if it's a slug like "demo-room" or too short to be a real ID
    const workflowId = (rawWorkflowId && rawWorkflowId !== 'demo-room' && rawWorkflowId.length > 15) 
        ? rawWorkflowId 
        : undefined;

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const internalKey = process.env.INTERNAL_API_KEY;
    
    if (!internalKey) {
        console.error('INTERNAL_API_KEY is not set in Next.js environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // 1. Determine Cost
    let cost = FALLBACK_COSTS[model] || 2;

    // 2. Get or create user in Convex
    let convexUserId: Id<'users'> | null = null;
    if (convexClient) {
      try {
        // Use email provided by client if available, otherwise construct fake email from Clerk ID
        const userEmail = email || (userId.includes('@') ? userId : `${userId}@clerk.user`);
        
        const user = await convexClient.mutation(api.users.getOrCreate, {
          email: userEmail,
          name: 'User',
        });
        convexUserId = (user && (user as { _id: Id<'users'> })._id) || null;
      } catch (error) {
        console.error('Failed to get/create user:', error);
        return res.status(500).json({ error: 'Failed to authenticate user DB record' });
      }
    }

    // 3. Create run record in Convex AND deduct credits
    let runId: Id<'runs'> | null = null;
    if (convexClient && convexUserId) {
      try {
        runId = await convexClient.mutation(api.runs.create, {
          workflowId: workflowId as Id<'workflows'> | undefined,
          userId: convexUserId,
          input: { model, prompt },
          cost: cost, // This triggers deduction in mutation
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Insufficient credits')) {
             return res.status(402).json({ error: 'Insufficient credits', detail: `This run requires ${cost} credits.` });
        }
        console.error('Failed to create run record:', error);
        return res.status(500).json({ error: 'Failed to initialize run transaction', detail: msg });
      }
    }

    // 4. Call AI Backend (returns task_id immediately)
    let response;
    try {
        response = await fetch(`${backendUrl}/api/v1/ai/infer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': internalKey,
            'x-user-id': userId,
        } as Record<string, string>,
        body: JSON.stringify({ 
            model, 
            prompt, 
            aspect_ratio, 
            guidance_scale, 
            output_format, 
            safety_tolerance, 
            seed 
        }),
        });
    } catch (netError) {
        // Network error to backend
         if (convexClient && runId) {
             await convexClient.mutation(api.runs.updateStatus, { id: runId, status: 'failed', error: 'Backend unavailable' });
         }
         throw netError;
    }

    if (!response.ok) {
        const errorText = await response.text();
        if (convexClient && runId) {
             await convexClient.mutation(api.runs.updateStatus, { id: runId, status: 'failed', error: errorText });
        }
        return res.status(response.status).json({ error: 'Backend run failed', detail: errorText });
    }

    const data = (await response.json()) as RunResponse;
    
    // Return task_id immediately, client will poll
    return res.status(200).json({ ...data, run_id: runId || undefined, status: 'processing' });
    
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: 'Failed to start run', detail: message });
  }
}
