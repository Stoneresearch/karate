"use client";
import React from 'react';
import Link from 'next/link';
import HeaderShell from './HeaderShell';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../lib/convex/api';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);

interface DashboardHeaderProps {
  onCreateNew: () => void;
  loading?: boolean;
}

export default function DashboardHeader({ onCreateNew, loading = false }: DashboardHeaderProps) {
  const credits = useQuery(api.users.getCredits, {});

  // 1. Brand (Left) - Simple Text Logo for App Context
  const leftContent = (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="h-7 w-7 rounded-md bg-[conic-gradient(from_180deg_at_50%_50%,#f97316_0deg,#22d3ee_120deg,#eab308_240deg,#f97316_360deg)] shadow-[0_0_22px_rgba(250,204,21,0.45)] group-hover:scale-105 transition-transform" />
      <span className="font-semibold tracking-tight text-xs uppercase text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
        Karate Studio
      </span>
    </Link>
  );

  // 2. Center - Empty for Dashboard (or could hold Search/Filter later)
  const centerContent = null;

  // 3. Actions (Right) - Sign In + Create Project Button
  const rightContent = (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Credit Badge */}
      <Link href="/dashboard/credits" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
           {credits !== undefined ? credits.toLocaleString() : '-'}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">Credits</span>
      </Link>

      <button
        onClick={onCreateNew}
        disabled={loading}
        className="btn-primary btn-compact text-[11px] md:text-xs disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'New project'}
      </button>

      {CLERK_ENABLED && (
        <>
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden md:inline-block text-[11px] px-3 py-1.5 rounded-full border border-zinc-300/70 text-zinc-600 hover:text-zinc-900 hover:border-zinc-500 dark:text-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500 transition-colors"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    'w-8 h-8 rounded-full border border-zinc-200/70 dark:border-zinc-700 shadow-sm',
                },
              }}
            />
          </SignedIn>
        </>
      )}
    </div>
  );

  return (
    <HeaderShell
      variant="app"
      isScrolled={true} // Dashboard always has background
      leftContent={leftContent}
      centerContent={centerContent}
      rightContent={rightContent}
      className="sticky top-0" // Dashboard uses sticky, not fixed
    />
  );
}

