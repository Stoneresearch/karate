'use client';
import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../lib/convex/api';
import HeaderShell from '../Layout/HeaderShell';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);

interface EditorHeaderProps {
  workflowTitle?: string;
  nodeCount: number;
  edgeCount: number;
  selectedTool: string | null;
  showMinimap: boolean;
  snapToGrid: boolean;
  outputPanelOpen: boolean;
  isProcessing?: boolean;
  onToggleMinimap: () => void;
  onToggleGrid: () => void;
  onToggleOutputs: () => void;
  onRun: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTitleChange?: (newTitle: string) => void;
}

export default function EditorHeader({
  workflowTitle = 'My First Flow',
  nodeCount,
  edgeCount,
  selectedTool,
  showMinimap,
  snapToGrid,
  outputPanelOpen,
  isProcessing = false,
  onToggleMinimap,
  onToggleGrid,
  onToggleOutputs,
  onRun,
  onUndo,
  onRedo,
  onTitleChange,
}: EditorHeaderProps) {
  const userCredits = useQuery(api.users.getCredits, {});
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(workflowTitle);

  React.useEffect(() => {
    setEditedTitle(workflowTitle);
  }, [workflowTitle]);

  const handleTitleSubmit = () => {
    if (onTitleChange && editedTitle.trim() !== "") {
      onTitleChange(editedTitle);
    }
    setIsEditing(false);
  };
  
  // 1. Left: Workflow Metadata
  const leftContent = (
    <div className="flex items-center">
      {/* Logo Placeholder */}
      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center mr-8">
        <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80" />
      </div>

      <div className="flex items-center gap-3 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
        {isEditing ? (
          <input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setEditedTitle(workflowTitle);
                setIsEditing(false);
              }
            }}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 focus:border-yellow-400 outline-none font-semibold max-w-[12rem] md:max-w-[18rem]"
          />
        ) : (
          <span 
            className="font-semibold text-zinc-900 dark:text-white truncate max-w-[12rem] md:max-w-[18rem] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-yellow-600 dark:hover:text-yellow-400 px-2 py-0.5 rounded transition-colors"
            onClick={() => setIsEditing(true)}
            title="Click to rename"
          >
            {workflowTitle}
          </span>
        )}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
        <span className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          {nodeCount} nodes
        </span>
        <span className="hidden md:flex items-center gap-1.5 ml-2">
          <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          {edgeCount} edges
        </span>
        {selectedTool && (
          <>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">{selectedTool}</span>
          </>
        )}
      </div>
    </div>
  );

  // 2. Center: Editor Controls (Zoom/Grid/Undo)
  const centerContent = (
    <div className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-full px-1 py-1 shadow-sm dark:shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <button
        onClick={onToggleMinimap}
        className={`w-8 h-8 rounded-full border text-[11px] ${
          showMinimap
            ? 'bg-yellow-300 text-black border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.45)]'
            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        } flex items-center justify-center transition-all`}
        title="Minimap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="6" rx="1"/><rect x="13" y="3" width="8" height="10" rx="1"/><rect x="3" y="11" width="8" height="10" rx="1"/></svg>
      </button>
      <button
        onClick={onToggleGrid}
        className={`w-8 h-8 rounded-full border text-[11px] ${
          snapToGrid
            ? 'bg-yellow-300 text-black border-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.45)]'
            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        } flex items-center justify-center transition-all`}
        title="Snap to grid"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3V3zm7 0h4v4h-4V3zm7 0h4v4h-4V3zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 17h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4z"/></svg>
      </button>
      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
      <button
        onClick={onUndo}
        className="w-8 h-8 rounded-full border bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all"
        title="Undo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l-4-4 4-4v3c5.523 0 10 4.477 10 10h-2a8 8 0 00-8-8z"/></svg>
      </button>
      <button
        onClick={onRedo}
        className="w-8 h-8 rounded-full border bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all"
        title="Redo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l4-4-4-4v3a10 10 0 00-10 10h2a8 8 0 018-8z"/></svg>
      </button>
    </div>
  );

  // 3. Right: Primary Actions (Run, Share, Outputs, Auth)
  const rightContent = (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Credit Badge (only if logged in/credits available) */}
      {userCredits !== undefined && (
        <Link href="/dashboard/credits" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors mr-1">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
             {userCredits.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Credits</span>
        </Link>
      )}

      <button
        type="button"
        onClick={onRun}
        disabled={isProcessing}
        className={`btn-primary btn-compact text-xs md:text-sm ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
        title="Run workflow"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
             <span className="hidden sm:inline">Run flow</span>
             <span className="sm:hidden">Run</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onToggleOutputs}
        className={`btn-compact rounded-full border text-xs md:text-sm px-4 ${
          outputPanelOpen
            ? 'bg-yellow-300 text-black border-yellow-300'
            : 'bg-transparent text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900'
        }`}
        title="Toggle outputs panel"
      >
        Outputs
      </button>

      <button
        type="button"
        className="hidden sm:inline-flex items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs md:text-sm text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition-colors"
        title="Share workflow (coming soon)"
      >
        Share
      </button>

      {CLERK_ENABLED ? (
        <div className="pl-2 ml-1 border-l border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden md:inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: 'w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm' } }}
            />
          </SignedIn>
        </div>
      ) : null}
    </div>
  );

  return (
    <HeaderShell
      variant="editor"
      isScrolled={true} // Editor always has background
      leftContent={leftContent}
      centerContent={centerContent}
      rightContent={rightContent}
    />
  );
}
