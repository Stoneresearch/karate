"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeaderShell from './HeaderShell';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);

interface LandingHeaderProps {
  isScrolled: boolean;
}

export default function LandingHeader({ isScrolled }: LandingHeaderProps) {
  // 1. Brand (Left) - Standard Karate Logo
  const leftContent = (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="h-8 w-8 rounded-sm bg-gradient-to-br from-[#f2c6ff] via-[#ffd27a] to-[#7ae1ff] group-hover:scale-105 transition-transform" />
      <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">KARATE</span>
    </Link>
  );

  // 2. Navigation (Center) - Marketing Links
  const centerContent = (
    <div className="hidden md:flex items-center gap-8 text-sm">
      {[
        { label: 'Docs', href: '/docs' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Explore workflows', href: '/dashboard' },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  // 3. Actions (Right) - Sign In + Start Now CTA
  const rightContent = (
    <div className="flex items-center gap-2 md:gap-3">
      <motion.a
        href="/dashboard"
        className="btn-primary btn-compact"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Start now
      </motion.a>

      {CLERK_ENABLED && (
        <>
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden md:inline-block text-xs md:text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
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

      {!CLERK_ENABLED && (
        <Link
          href="/sign-in"
          className="hidden md:inline-block text-xs md:text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          Sign in
        </Link>
      )}
    </div>
  );

  return (
    <HeaderShell
      variant="landing"
      isScrolled={isScrolled}
      leftContent={leftContent}
      centerContent={centerContent}
      rightContent={rightContent}
      className="fixed top-0 left-0 right-0"
    />
  );
}

