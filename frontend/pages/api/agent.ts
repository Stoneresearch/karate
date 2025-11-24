import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type AgentRequest = {
  prompt: string;
  history?: { role: string; content: string }[];
};

type AgentResponse = {
  message: string;
  action?: {
    type: string;
    nodes: any[];
    edges: any[];
  };
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<AgentResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '', error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: '', error: 'Unauthorized' });

    const { prompt, history } = req.body as AgentRequest;
    if (!prompt) return res.status(400).json({ message: '', error: 'Prompt required' });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const internalKey = process.env.INTERNAL_API_KEY || 'dev-secret';

    const response = await fetch(`${backendUrl}/api/v1/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': internalKey,
        'x-user-id': userId,
      },
      body: JSON.stringify({ prompt, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent backend error:', errorText);
      return res.status(response.status).json({ message: '', error: 'Agent failed to respond' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Agent proxy error:', err);
    return res.status(500).json({ message: '', error: 'Internal server error' });
  }
}

