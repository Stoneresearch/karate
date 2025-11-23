import type { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import handler from '../pages/api/run';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({ userId: 'user_123' })),
}));

// Avoid constructing a real Convex client during tests
vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    mutation: vi.fn().mockImplementation((apiFunc, args) => {
        // Mock success for create run
        if (apiFunc === 'api.runs.create' || String(apiFunc).includes('create')) {
            return Promise.resolve('run_123'); 
        }
        // Mock success for user
        if (apiFunc === 'api.users.getOrCreate' || String(apiFunc).includes('getOrCreate')) {
             return Promise.resolve({ _id: 'user_convex_123', credits: 100 });
        }
        // Mock update status
        if (apiFunc === 'api.runs.updateStatus' || String(apiFunc).includes('updateStatus')) {
            return Promise.resolve({});
        }
        return Promise.resolve({});
    }),
  })),
}));

// Use a minimal api proxy so run handler import of api works
vi.mock('../lib/convex/api', async () => {
  return {
    api: {
      runs: { create: 'api.runs.create', updateStatus: 'api.runs.updateStatus' },
      users: { getOrCreate: 'api.users.getOrCreate' }
    }
  };
});

describe('/api/run handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
    // Force Convex URL to ensure the Convex branch is taken in the handler
    process.env.NEXT_PUBLIC_CONVEX_URL = 'http://localhost:3210'; 
    
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://example.com/output.png' }),
    } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 200 and forwards backend result when authorized', async () => {
    process.env.BACKEND_URL = 'http://localhost:8000';
    process.env.INTERNAL_API_KEY = 'dev-secret';

    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      url: '/api/run',
      body: { model: 'stable-diffusion-3.5', prompt: 'a cat' },
    });
    const res = httpMocks.createResponse<NextApiResponse>();

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.url || data.output_url).toBe('https://example.com/output.png');
  });

  it('returns 401 when user is not authorized', async () => {
    // Swap mock to simulate no user
    const { getAuth } = await import('@clerk/nextjs/server');
    (getAuth as any).mockImplementation(() => ({ userId: null }));

    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      url: '/api/run',
      body: { model: 'stable-diffusion-3.5', prompt: 'a cat' },
    });
    const res = httpMocks.createResponse<NextApiResponse>();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
  });
});
