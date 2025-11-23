"use client";
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'http://localhost:3210';
const convex = new ConvexReactClient(convexUrl);

export function ConvexProviderRoot({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}


