"use client";
import React from 'react';
import HeaderShell from './HeaderShell';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(pk);

interface EditorHeaderProps {
  workflowTitle: string;
  stats: { nodes: number; edges: number; selectedTool?: string | null };
  showMinimap: boolean;
  setShowMinimap: (v: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRun: () => void;
  onShare: () => void;
  outputPanelOpen: boolean;
  setOutputPanelOpen: (v: boolean) => void;
  onTitleChange?: (newTitle: string) => void;
}

export default function EditorHeader({
  workflowTitle,
  stats,
  showMinimap,
  setShowMinimap,
  snapToGrid,
  setSnapToGrid,
  onUndo,
  onRedo,
  onRun,
  onShare,
  outputPanelOpen,
  setOutputPanelOpen,
  onTitleChange,
}: EditorHeaderProps) {
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
    <div className="flex items-center gap-3 text-sm text-zinc-400">
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
          className="bg-zinc-800 text-white px-1 rounded border border-zinc-700 focus:border-yellow-400 outline-none font-semibold"
          style={{ width: `${Math.max(editedTitle.length + 1, 10)}ch` }}
        />
      ) : (
        <span 
          className="font-semibold text-white cursor-pointer hover:bg-zinc-800 hover:text-yellow-400 px-1 rounded transition-colors"
          onClick={() => setIsEditing(true)}
          title="Click to rename"
        >
          {workflowTitle}
        </span>
      )}
      <span>•</span>
      <span>{stats.nodes} nodes</span>
      <span>•</span>
      <span>{stats.edges} connections</span>
      {stats.selectedTool && (
        <>
          <span>•</span>
          <span className="text-yellow-400">{stats.selectedTool}</span>
        </>
      )}
    </div>
  );

  // 2. Center: Canvas Controls (Minimap, Snap, Undo/Redo)
  const centerContent = (
    <div className="flex items-center gap-1 bg-zinc-900/70 border border-zinc-700 rounded-md p-1">
      <button
        onClick={() => setShowMinimap(!showMinimap)}
        className={`w-8 h-8 rounded-md border ${showMinimap ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'} flex items-center justify-center`}
        title="Minimap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="6" rx="1"/><rect x="13" y="3" width="8" height="10" rx="1"/><rect x="3" y="11" width="8" height="10" rx="1"/></svg>
      </button>
      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`w-8 h-8 rounded-md border ${snapToGrid ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'} flex items-center justify-center`}
        title="Snap to grid"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3V3zm7 0h4v4h-4V3zm7 0h4v4h-4V3zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 17h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4z"/></svg>
      </button>
      <button
        onClick={onUndo}
        className="w-8 h-8 rounded-md border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white flex items-center justify-center"
        title="Undo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l-4-4 4-4v3c5.523 0 10 4.477 10 10h-2a8 8 0 00-8-8z"/></svg>
      </button>
      <button
        onClick={onRedo}
        className="w-8 h-8 rounded-md border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white flex items-center justify-center"
        title="Redo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l4-4-4-4v3a10 10 0 00-10 10h2a8 8 0 018-8z"/></svg>
      </button>
    </div>
  );

  // 3. Right: Actions (Run, Share, Output, Auth)
  const rightContent = (
    <>
      <Tooltip title="Run workflow">
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={onRun}
          sx={{
            backgroundColor: '#fbbf24',
            color: '#000',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#fcd34d', boxShadow: '0 0 15px rgba(250, 204, 21, 0.5)' },
          }}
        >
          Run
        </Button>
      </Tooltip>
      <Tooltip title="Share workflow">
        <Button
          variant="outlined"
          size="small"
          startIcon={<ShareIcon />}
          onClick={onShare}
          sx={{
            color: '#06b6d4',
            borderColor: '#164e63',
            '&:hover': { backgroundColor: '#0c4a6e', borderColor: '#06b6d4' },
          }}
        >
          Share
        </Button>
      </Tooltip>

      <Tooltip title="Outputs">
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOutputPanelOpen(!outputPanelOpen)}
          sx={{ color: outputPanelOpen ? '#000' : '#e5e7eb', borderColor: outputPanelOpen ? '#fbbf24' : '#3f3f46', backgroundColor: outputPanelOpen ? '#fbbf24' : 'transparent', '&:hover': { backgroundColor: outputPanelOpen ? '#fcd34d' : '#27272a' } }}
        >
          Outputs
        </Button>
      </Tooltip>

      {CLERK_ENABLED ? (
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outlined" size="small">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </SignedIn>
        </div>
      ) : null}
    </>
  );

  return (
    <HeaderShell
      variant="editor"
      leftContent={leftContent}
      centerContent={centerContent}
      rightContent={rightContent}
    />
  );
}
