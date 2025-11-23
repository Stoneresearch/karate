"use client";
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);

interface HeaderShellProps {
  variant?: 'landing' | 'app' | 'editor';
  isScrolled?: boolean;
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}

export default function HeaderShell({
  variant = 'app',
  isScrolled = false,
  leftContent,
  centerContent,
  rightContent,
  className = '',
}: HeaderShellProps) {
  // Base styles for the header container
  // Positioning (fixed/sticky/static) is controlled by the consumer via className
  const baseStyles = 'w-full z-50 transition-all duration-500 border-b';
  
  // Dynamic background styles based on scroll state and variant
  const bgStyles =
    isScrolled || variant === 'app' || variant === 'editor'
      ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-zinc-200/60 dark:border-zinc-800/80 shadow-[0_18px_60px_rgba(0,0,0,0.28)]'
      : 'bg-transparent border-transparent';

  // Editor variant has specific height/padding requirements
  const containerStyles =
    variant === 'editor'
      ? 'h-14 px-4 md:px-6 flex items-center justify-between'
      : 'max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between';

  // Default Logo if no left content provided
  const defaultLeft = (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="h-8 w-8 rounded-sm bg-gradient-to-br from-[#f2c6ff] via-[#ffd27a] to-[#7ae1ff] group-hover:scale-105 transition-transform" />
      <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">KARATE</span>
    </Link>
  );

  // Default Auth if no right content provided (appends to rightContent if passed as fragment)
  const authButtons = CLERK_ENABLED ? (
    <div className="flex items-center gap-4">
      <SignedOut>
        <Link
          href="/sign-in"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden md:block"
        >
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
      </SignedIn>
    </div>
  ) : (
    <div className="flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden md:block"
        >
          Sign in
        </Link>
    </div>
  );

  return (
    <motion.nav
      className={`${baseStyles} ${bgStyles} ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={containerStyles}>
        <div className="flex items-center gap-3 md:gap-4">
          {leftContent || defaultLeft}
        </div>

        <div className="flex-1 flex justify-center">
          {centerContent}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {rightContent}
          {!rightContent && authButtons} 
          {/* Note: If rightContent is provided, consumer must include auth buttons manually if desired, 
              or we can append them. For this shell, we let rightContent take full control if present. */}
        </div>
      </div>
    </motion.nav>
  );
}

