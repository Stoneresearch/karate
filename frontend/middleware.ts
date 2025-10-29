import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const HAS_CLERK = !!process.env.CLERK_SECRET_KEY;

export default async function middleware(req: NextRequest) {
  if (!HAS_CLERK) return NextResponse.next();
  const { clerkMiddleware } = await import('@clerk/nextjs/server');
  const handler = clerkMiddleware((auth: any) => auth().protect());
  // @ts-expect-error Clerk types return an Edge middleware handler
  return handler(req);
}

export const config = {
  matcher: [
    // Protect app pages
    '/editor',
    '/dashboard',
    // Protect API that triggers model runs
    '/api/run',
    // Do NOT protect Stripe webhooks (server-to-server)
    // '/api/stripe/webhook' is intentionally excluded
  ],
};


