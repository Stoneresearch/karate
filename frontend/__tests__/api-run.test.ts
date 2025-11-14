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
    mutation: vi.fn().mockResolvedValue({ _id: 'run_123' }),
  })),
}));

// Use a minimal api proxy so run handler import of api works
vi.mock('../lib/convex/api', async () => {
  const mod = await vi.importActual<any>('../lib/convex/api');
  return mod;
});

describe('/api/run handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
    // Default: no Convex URL so Convex client is not created
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
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


