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

    // If completed, fetch the image and store it in Convex Storage (PERSISTENCE)
    if (data.status === 'completed' && (data.output_url || data.url) && convexClient) {
        try {
            const tempUrl = data.output_url || data.url;
            
            // 1. Check if we already stored it (optimization? maybe overkill for now)
            
            // 2. Fetch the image data from Replicate
            const imgRes = await fetch(tempUrl);
            if (imgRes.ok) {
                const blob = await imgRes.blob();
                const contentType = imgRes.headers.get('content-type') || 'image/png';
                
                // 3. Generate Upload URL from Convex
                const postUrl = await convexClient.mutation(api.workflows.generateUploadUrl, {});
                
                // 4. Upload to Convex Storage
                const uploadRes = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": contentType },
                    body: blob,
                });
                
                if (uploadRes.ok) {
                    const { storageId } = await uploadRes.json();
                    
                    // 5. Get Permanent URL
                    const permanentUrl = await convexClient.mutation(api.workflows.getFileUrl, { storageId });
                    
                    if (permanentUrl) {
                        // Replace the temp Replicate URL with our permanent one
                        data.output_url = permanentUrl;
                        data.url = permanentUrl;
                        
                        // Register file in DB for tracking (optional but good for "my files" view later)
                        // We need the userId for this, but status endpoint doesn't have it easily.
                        // We can skip strictly linking to user in 'files' table for now, 
                        // or we can update 'runs' table which IS linked to user.
                    }
                }
            }
        } catch (err) {
            console.error("Failed to persist Replicate output:", err);
            // Fallback: keep the temp URL so the user at least sees it
        }
    }

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

