import { NextResponse, NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const HAS_CLERK = !!process.env.CLERK_SECRET_KEY;
const isProtectedRoute = createRouteMatcher([
  '/editor(.*)',
  '/dashboard(.*)',
  '/api/run',
]);

export default clerkMiddleware(async (auth: any, req: NextRequest) => {
  if (!HAS_CLERK) {
    return NextResponse.next();
  }
  // If Clerk is present, protect routes
  // Note: auth() is now a function in newer Clerk versions
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
