import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const HAS_CLERK = !!process.env.CLERK_SECRET_KEY;
const isProtectedRoute = createRouteMatcher([
  '/editor(.*)',
  '/dashboard(.*)',
  '/api/run',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!HAS_CLERK) {
    return NextResponse.next();
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api)(.*)',
  ],
};


