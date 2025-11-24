import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../lib/convex/api';
import type { Id } from '../../../convex/_generated/dataModel';

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
    const { model, prompt, workflowId: rawWorkflowId, aspect_ratio, guidance_scale, output_format, safety_tolerance, seed, email, image, mask } = (req.body || {}) as RunRequestBody & { email?: string, image?: string, mask?: string };
    
    if (!model) return res.status(400).json({ error: 'model required' });
    // Relaxed validation: some models (upscalers) don't need a prompt if they have an image
    if (!prompt && !image) return res.status(400).json({ error: 'Either prompt or image is required' });

    // Validate workflowId: ignore if it's a slug like "demo-room" or too short to be a real ID
    const workflowId = (rawWorkflowId && rawWorkflowId !== 'demo-room' && rawWorkflowId.length > 15) 
        ? rawWorkflowId 
        : undefined;

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const internalKey = process.env.INTERNAL_API_KEY;
    
    if (!internalKey) {
        console.error('INTERNAL_API_KEY is not set in Next.js environment');
        // Attempt to use a default for local dev if environment is missing it
        if (process.env.NODE_ENV === 'development') {
            console.warn('Falling back to default INTERNAL_API_KEY: dev-secret');
        } else {
            return res.status(500).json({ error: 'Server configuration error' });
        }
    }

    const effectiveKey = internalKey || 'dev-secret';

    // 1. Determine Cost
    let cost = FALLBACK_COSTS[model] || 2;

    // 2. Get or create user in Convex (Non-blocking for robustness)
    let convexUserId: Id<'users'> | null = null;
    let runId: Id<'runs'> | null = null;

    if (convexClient) {
      try {
        // Use email provided by client if available, otherwise construct fake email from Clerk ID
        const userEmail = email || (userId.includes('@') ? userId : `${userId}@clerk.user`);
        
        const user = await convexClient.mutation(api.users.getOrCreate, {
          email: userEmail,
          name: 'User',
        });
        convexUserId = (user && (user as { _id: Id<'users'> })._id) || null;

        // 3. Create run record in Convex AND deduct credits (if user exists)
        if (convexUserId) {
            runId = await convexClient.mutation(api.runs.create, {
                workflowId: workflowId as Id<'workflows'> | undefined,
                userId: convexUserId,
                input: { model, prompt },
                cost: cost, 
            });
        }
      } catch (error) {
        // Log but allow proceed if DB fails. 
        // If insufficient credits error, we SHOULD fail.
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Insufficient credits')) {
             return res.status(402).json({ error: 'Insufficient credits', detail: `This run requires ${cost} credits.` });
        }
        
        console.error('Convex DB Error (Run will proceed without tracking):', error);
        // We proceed without runId. Status polling will still work via task_id from backend.
      }
    }

    // 4. Call AI Backend (returns task_id immediately)
    let response;
    try {
        response = await fetch(`${backendUrl}/api/v1/ai/infer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': effectiveKey,
            'x-user-id': userId,
        } as Record<string, string>,
        body: JSON.stringify({ 
            model, 
            prompt, 
            image,
            mask,
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
