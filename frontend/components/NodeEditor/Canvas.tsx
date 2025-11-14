"use client";
import { useCallback, useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  useReactFlow,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, NodeTypes } from '@xyflow/react';
import type { PaletteItem, ContextMenuState } from './types';
import '@xyflow/react/dist/style.css';
import { useWorkflow } from '../Realtime/Collaboration';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Button, Tooltip } from '@mui/material';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED = typeof pk === 'string' && pk.startsWith('pk_') && pk.length > 16;
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import HandymanIcon from '@mui/icons-material/Handyman';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  StableDiffusionNode,
  ImageNode,
  TextNode,
  UpscaleNode,
  InpaintNode,
  PromptNode,
  ImageUploadNode,
} from './NodeTypes';

const nodeTypes: Record<string, unknown> = {
  stableDiffusion: StableDiffusionNode,
  image: ImageNode,
  text: TextNode,
  upscale: UpscaleNode,
  inpaint: InpaintNode,
  prompt: PromptNode,
  imageUpload: ImageUploadNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
type OutputItem = { url: string; model: string; prompt: string; ts: number };

type CanvasProps = { roomId: string };

export default function Canvas({ roomId }: CanvasProps) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [scrollToCategory, setScrollToCategory] = useState<string | undefined>(undefined);
  const [focusSearchSignal, setFocusSearchSignal] = useState<number>(0);
  const [sidebarTab, setSidebarTab] = useState<'models' | 'tools'>('models');
  const [railManualKey, setRailManualKey] = useState<string | undefined>(undefined);
  const [outputPanelOpen, setOutputPanelOpen] = useState<boolean>(false);
  const [outputs, setOutputs] = useState<OutputItem[]>([]);

  // Models and tools data
  const models: PaletteItem[] = [
    { name: 'Stable Diffusion 3.5', type: 'stableDiffusion', icon: '🎨', symbol: 'SD', category: 'Image Gen', brand: 'Stability', logo: 'https://logo.clearbit.com/stability.ai' },
    { name: 'GPT Image 1', type: 'stableDiffusion', icon: '🧠', symbol: 'GPT', category: 'Image Gen', brand: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com' },
    { name: 'Imagen 4', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Imagen 4 Fast', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Imagen 4 Ultra', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Imagen 3', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Imagen 3 Fast', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Flux Pro 1.1 Ultra', type: 'stableDiffusion', icon: '⚡', symbol: 'FX', category: 'Image Gen', brand: 'Flux', logo: 'https://logo.clearbit.com/blackforestlabs.ai' },
    { name: 'Flux Dev Redux', type: 'stableDiffusion', icon: '⚡', symbol: 'FX', category: 'Image Gen', brand: 'Flux', logo: 'https://logo.clearbit.com/blackforestlabs.ai' },
    { name: 'Flux Canny Pro', type: 'stableDiffusion', icon: '⚡', symbol: 'FX', category: 'Image Gen', brand: 'Flux', logo: 'https://logo.clearbit.com/blackforestlabs.ai' },
    { name: 'Flux Depth Pro', type: 'stableDiffusion', icon: '⚡', symbol: 'FX', category: 'Image Gen', brand: 'Flux', logo: 'https://logo.clearbit.com/blackforestlabs.ai' },
    { name: 'DALL·E 3', type: 'stableDiffusion', icon: '🎨', symbol: 'DAL', category: 'Image Gen', brand: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com' },
    { name: 'Ideogram V3', type: 'stableDiffusion', icon: '📝', symbol: 'ID3', category: 'Image Gen', brand: 'Ideogram', logo: 'https://logo.clearbit.com/ideogram.ai' },
    { name: 'Ideogram V2', type: 'stableDiffusion', icon: '📝', symbol: 'ID2', category: 'Image Gen', brand: 'Ideogram', logo: 'https://logo.clearbit.com/ideogram.ai' },
    { name: 'Minimax Image', type: 'stableDiffusion', icon: '🎵', symbol: 'MX', category: 'Image Gen', brand: 'Minimax' },
    { name: 'Bria', type: 'stableDiffusion', icon: '🎪', symbol: 'BR', category: 'Image Gen', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'SD3 Remove Background', type: 'image', icon: '🎭', symbol: 'SD', category: 'Image Enhance', brand: 'Stability', logo: 'https://logo.clearbit.com/stability.ai' },
    { name: 'SD3 Content-Aware Fill', type: 'image', icon: '🎨', symbol: 'SD', category: 'Image Enhance', brand: 'Stability', logo: 'https://logo.clearbit.com/stability.ai' },
    { name: 'Bria Remove Background', type: 'image', icon: '🎭', symbol: 'BR', category: 'Image Enhance', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Bria Content-Aware Fill', type: 'image', icon: '🎨', symbol: 'BR', category: 'Image Enhance', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Replace Background', type: 'image', icon: '🌅', symbol: 'BR', category: 'Image Enhance', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Bria Replace Background', type: 'image', icon: '🌅', symbol: 'BR', category: 'Image Enhance', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Relight 2.0', type: 'image', icon: '💡', symbol: 'RL', category: 'Image Enhance', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Kolors Virtual Try On', type: 'image', icon: '👗', symbol: 'KL', category: 'Image Enhance', brand: 'Kolors' },
    { name: 'Image Upscale / Clarity', type: 'upscale', icon: '🔍', symbol: 'UP', category: 'Upscale', brand: 'Clarity' },
    { name: 'Topaz Video Upscaler', type: 'upscale', icon: '📺', symbol: 'TZ', category: 'Upscale', brand: 'Topaz', logo: 'https://logo.clearbit.com/topazlabs.com' },
    { name: 'Real-ESRGAN Video Upscaler', type: 'upscale', icon: '🎬', symbol: 'RES', category: 'Upscale', brand: 'ESRGAN' },
    { name: 'Bria Upscale', type: 'upscale', icon: '📈', symbol: 'BR', category: 'Upscale', brand: 'Bria', logo: 'https://logo.clearbit.com/bria.ai' },
    { name: 'Image Upscale / Real-ESRGAN', type: 'upscale', icon: '🔍', symbol: 'RES', category: 'Upscale', brand: 'ESRGAN' },
    { name: 'Runway Aleph', type: 'stableDiffusion', icon: '🎬', symbol: 'RW', category: 'Video Gen', brand: 'Runway', logo: 'https://logo.clearbit.com/runwayml.com' },
    { name: 'Runway Act-Two', type: 'stableDiffusion', icon: '🎬', symbol: 'RW', category: 'Video Gen', brand: 'Runway', logo: 'https://logo.clearbit.com/runwayml.com' },
    { name: 'Runway Gen-4', type: 'stableDiffusion', icon: '🎬', symbol: 'RW', category: 'Video Gen', brand: 'Runway', logo: 'https://logo.clearbit.com/runwayml.com' },
    { name: 'Runway Gen-3', type: 'stableDiffusion', icon: '🎬', symbol: 'RW', category: 'Video Gen', brand: 'Runway', logo: 'https://logo.clearbit.com/runwayml.com' },
    { name: 'Luma Reframe', type: 'stableDiffusion', icon: '🎞️', symbol: 'LU', category: 'Video Gen', brand: 'Luma', logo: 'https://logo.clearbit.com/luma.ai' },
    { name: 'Luma Modify', type: 'stableDiffusion', icon: '🎞️', symbol: 'LU', category: 'Video Gen', brand: 'Luma', logo: 'https://logo.clearbit.com/luma.ai' },
    { name: 'Veo 3', type: 'stableDiffusion', icon: '🎬', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo 3 Fast', type: 'stableDiffusion', icon: '🎬', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo 3.1', type: 'stableDiffusion', icon: '🎬', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo 3.1 Fast', type: 'stableDiffusion', icon: '🎬', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo 2', type: 'stableDiffusion', icon: '🎬', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo Text to Video', type: 'stableDiffusion', icon: '📝', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo Image to Video', type: 'stableDiffusion', icon: '🖼️', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Sora 2', type: 'stableDiffusion', icon: '🎥', symbol: 'SR', category: 'Video Gen', brand: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com' },
    { name: 'Hunyuan Video to Video', type: 'stableDiffusion', icon: '🎥', symbol: 'HY', category: 'Video Gen', brand: 'Hunyuan', logo: 'https://logo.clearbit.com/tencent.com' },
    { name: 'Gemini 2.5 Flash Image', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Gemini 2.5 Flash', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Advanced', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Lyria 2', type: 'stableDiffusion', icon: '🎵', symbol: 'LY', category: 'Advanced', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Google Upscaler', type: 'upscale', icon: '🔍', symbol: 'UP', category: 'Upscale', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Video Smoother', type: 'image', icon: '✨', symbol: 'VS', category: 'Video Enhance', brand: 'AI' },
    { name: 'Increase Frame-rate', type: 'image', icon: '⚡', symbol: 'FR', category: 'Video Enhance', brand: 'AI' },
    { name: 'Video to Audio', type: 'image', icon: '🎵', symbol: 'V2A', category: 'Video Enhance', brand: 'AI' },
    { name: 'Seedream V4 Edit', type: 'image', icon: '🎬', symbol: 'SD', category: 'Video Enhance', brand: 'Seedream' },
    { name: 'Reve Edit', type: 'image', icon: '🎨', symbol: 'REV', category: 'Video Enhance', brand: 'Reve' },
    { name: 'Omnihuman V1.5', type: 'image', icon: '👥', symbol: 'OMN', category: 'Lip Sync', brand: 'Omnihuman', logo: 'https://logo.clearbit.com/tencent.com' },
    { name: 'Sync 2 Pro', type: 'image', icon: '🎤', symbol: 'SYN', category: 'Lip Sync', brand: 'Sync' },
    { name: 'Pixverse Lipsync', type: 'image', icon: '👄', symbol: 'PIX', category: 'Lip Sync', brand: 'Pixverse', logo: 'https://logo.clearbit.com/pixverse.ai' },
    { name: 'Kling AI Avatar', type: 'image', icon: '🤖', symbol: 'KLG', category: 'Lip Sync', brand: 'Kling', logo: 'https://logo.clearbit.com/klingai.com' },
    { name: 'Rodin', type: 'stableDiffusion', icon: '🎭', symbol: 'ROD', category: '3D', brand: 'Rodin' },
    { name: 'Hunyuan 3D', type: 'stableDiffusion', icon: '🎪', symbol: 'HY3', category: '3D', brand: 'Hunyuan', logo: 'https://logo.clearbit.com/tencent.com' },
    { name: 'Trellis', type: 'stableDiffusion', icon: '📦', symbol: 'TRL', category: '3D', brand: 'Trellis', logo: 'https://logo.clearbit.com/trellis.xyz' },
    { name: 'Meshy', type: 'stableDiffusion', icon: '🧩', symbol: 'MSH', category: '3D', brand: 'Meshy', logo: 'https://logo.clearbit.com/meshy.ai' },
    { name: 'Wan Vace Depth', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan Vace Pose', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan Vace Reframe', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan Vace Outpaint', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan 2.5', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan 2.2', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Wan2.1 With Lora', type: 'stableDiffusion', icon: '🔷', symbol: 'WN', category: 'Advanced', brand: 'Wan' },
    { name: 'Prompt', type: 'prompt', icon: '📝', symbol: 'PR', category: 'Helpers', brand: 'AI' },
    { name: 'Image Upload', type: 'imageUpload', icon: '📤', symbol: 'UP', category: 'Helpers', brand: 'AI' },
  ];

  const tools: PaletteItem[] = [
    { name: 'Remove Background', type: 'image', icon: '🎭', symbol: 'BG-', category: 'Background', brand: 'AI' },
    { name: 'Replace Background', type: 'image', icon: '🌅', symbol: 'BG+', category: 'Background', brand: 'AI' },
    { name: 'Content-Aware Fill', type: 'image', icon: '🎨', symbol: 'FILL', category: 'Background', brand: 'AI' },
    { name: 'Upscale', type: 'upscale', icon: '🔍', symbol: '↑↑', category: 'Edit', brand: 'AI' },
    { name: 'Inpaint', type: 'inpaint', icon: '🖌️', symbol: 'PAINT', category: 'Edit', brand: 'AI' },
    { name: 'Crop', type: 'image', icon: '✂️', symbol: 'CROP', category: 'Edit', brand: 'AI' },
    { name: 'Blur', type: 'image', icon: '💨', symbol: 'BLUR', category: 'Edit', brand: 'AI' },
    { name: 'Invert', type: 'image', icon: '🔄', symbol: 'INV', category: 'Edit', brand: 'AI' },
    { name: 'Relight', type: 'image', icon: '💡', symbol: 'LITE', category: 'Edit', brand: 'AI' },
    { name: 'Video Smoother', type: 'image', icon: '✨', symbol: 'SMOOTH', category: 'Video', brand: 'AI' },
    { name: 'Frame Interpolation', type: 'image', icon: '⚡', symbol: 'FPS', category: 'Video', brand: 'AI' },
    { name: 'Video to Audio', type: 'image', icon: '🎵', symbol: 'V→A', category: 'Video', brand: 'AI' },
    { name: 'Audio to Video', type: 'image', icon: '🎤', symbol: 'A→V', category: 'Video', brand: 'AI' },
    { name: 'Control / IPAdapter SDXL', type: 'image', icon: '⚙️', symbol: 'CTL', category: 'Control', brand: 'SD' },
    { name: 'ID Preservation - Flux', type: 'image', icon: '👤', symbol: 'ID', category: 'Control', brand: 'Flux', logo: 'https://logo.clearbit.com/blackforestlabs.ai' },
    { name: 'LoRA Control', type: 'image', icon: '🎛️', symbol: 'LORA', category: 'Control', brand: 'AI' },
    { name: 'Vectorizer', type: 'image', icon: '📐', symbol: 'VEC', category: 'Graphics', brand: 'AI' },
    { name: 'Recraft V3 SVG', type: 'image', icon: '✏️', symbol: 'RC', category: 'Graphics', brand: 'Recraft', logo: 'https://logo.clearbit.com/recraft.ai' },
    { name: 'Text To Vector', type: 'image', icon: '📝', symbol: 'T→V', category: 'Graphics', brand: 'AI' },
    { name: 'Face Align', type: 'image', icon: '👁️', symbol: 'FACE', category: 'Face', brand: 'AI' },
    { name: 'Nano Banana', type: 'image', icon: '🍌', symbol: 'NB', category: 'Face', brand: 'Nano' },
    { name: 'Dreamshaper V8', type: 'image', icon: '💭', symbol: 'DS', category: 'Face', brand: 'Dream' },
    { name: 'Prompt', type: 'prompt', icon: '📝', symbol: 'PR', category: 'Helpers', brand: 'AI' },
    { name: 'Image Upload', type: 'imageUpload', icon: '📤', symbol: 'UP', category: 'Helpers', brand: 'AI' },
  ];

  return (
    <ReactFlowProvider>
      <CanvasContent
        roomId={roomId}
        nodes={nodes}
        setNodes={setNodes}
        edges={edges}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        models={models}
        tools={tools}
        addNode={() => {}}
        // sync active category from sidebar for icon rail highlighting
        activeCategory={activeCategory}
        onRequestScrollToCategory={(cat?: string) => setScrollToCategory(cat)}
        onActiveCategoryChange={(cat: string) => { setActiveCategory(cat); setRailManualKey(undefined); }}
        scrollToCategory={scrollToCategory}
        onConsumeScrollToCategory={() => setScrollToCategory(undefined)}
        focusSearchSignal={focusSearchSignal}
        onSearchRequested={() => setFocusSearchSignal((s) => s + 1)}
        externalActiveTab={sidebarTab}
        outputs={outputs}
        setOutputs={setOutputs}
        outputPanelOpen={outputPanelOpen}
        setOutputPanelOpen={setOutputPanelOpen}
      />
    </ReactFlowProvider>
  );
}

// Inner component that has access to React Flow context
interface CanvasContentProps extends CanvasProps {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  models: PaletteItem[];
  tools: PaletteItem[];
  addNode: (type: string, label: string) => void;
  activeCategory: string;
  onRequestScrollToCategory: (category?: string) => void;
  onActiveCategoryChange?: (category: string) => void;
  scrollToCategory?: string;
  onConsumeScrollToCategory?: () => void;
  focusSearchSignal?: number;
  onSearchRequested?: () => void;
  externalActiveTab?: 'models' | 'tools';
  outputs: OutputItem[];
  setOutputs: Dispatch<SetStateAction<OutputItem[]>>;
  outputPanelOpen: boolean;
  setOutputPanelOpen: Dispatch<SetStateAction<boolean>>;
}

function CanvasContent({
  roomId,
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodesChange,
  onEdgesChange,
  sidebarOpen,
  setSidebarOpen,
  models,
  tools,
  addNode,
  activeCategory,
  onRequestScrollToCategory,
  onActiveCategoryChange,
  scrollToCategory,
  onConsumeScrollToCategory,
  focusSearchSignal,
  onSearchRequested,
  externalActiveTab,
  outputs,
  setOutputs,
  outputPanelOpen,
  setOutputPanelOpen,
}: CanvasContentProps) {
  const { resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || 'dark') === 'dark';
  const { workflow, updateWorkflow } = useWorkflow(roomId);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const [railManualKey, setRailManualKey] = useState<string | undefined>(undefined);
  const [sidebarTabLocal, setSidebarTabLocal] = useState<'models' | 'tools'>(externalActiveTab || 'models');
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [settingsNodeId, setSettingsNodeId] = useState<string | null>(null);
  // Assistant dock state
  const [agentOpen, setAgentOpen] = useState<boolean>(false);
  const [agentBusy, setAgentBusy] = useState<boolean>(false);
  const [agentInput, setAgentInput] = useState<string>("");
  const [agentHidden, setAgentHidden] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (externalActiveTab) setSidebarTabLocal(externalActiveTab);
  }, [externalActiveTab]);

  // Sync with Convex workflow on load only
  useEffect(() => {
    if (workflow?.nodes && workflow.nodes.length > 0) {
      setNodes(workflow.nodes);
    }
    if (workflow?.edges && workflow.edges.length > 0) {
      setEdges(workflow.edges);
    }
  }, [workflow?._id]);

  // Persist layout and preferences
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`canvas-prefs`) : null;
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (typeof prefs.showMinimap === 'boolean') setShowMinimap(prefs.showMinimap);
        if (typeof prefs.snapToGrid === 'boolean') setSnapToGrid(prefs.snapToGrid);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('canvas-prefs', JSON.stringify({ showMinimap, snapToGrid }));
    }
  }, [showMinimap, snapToGrid]);

  // Debounced save to Convex
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (nodes.length > 0) {
        updateWorkflow({ nodes });
      }
      if (edges.length >= 0) {
        updateWorkflow({ edges });
      }
    }, 1000);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, edges, roomId, updateWorkflow]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;
      
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.sourceHandle || 'source'}-${connection.target}-${connection.targetHandle || 'target'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || 'source',
        targetHandle: connection.targetHandle || 'target',
        animated: true,
      };

      const exists = edges.some(
        (e: Edge) => e.source === connection.source && 
               e.target === connection.target &&
               e.sourceHandle === (connection.sourceHandle || 'source') &&
               e.targetHandle === (connection.targetHandle || 'target')
      );
      
      if (!exists) {
        setEdges([...edges, newEdge]);
      }
    },
    [edges, setEdges]
  );

  // Minimal run handler: extract first prompt and first model label
  const handleRun = useCallback(async () => {
    try {
      const firstPrompt = nodes.find((n) => n.type === 'prompt');
      const firstModel = nodes.find((n) => n.type === 'stableDiffusion');
      const firstPromptData = (firstPrompt?.data ?? {}) as { prompt?: string; label?: string };
      const firstModelData = (firstModel?.data ?? {}) as { label?: string };
      const promptText = firstPromptData.prompt || firstPromptData.label || 'Generate an image';
      const modelLabel = firstModelData.label || 'Stable Diffusion 3.5';
      const modelMap: Record<string, string> = {
        'Stable Diffusion 3.5': 'stable-diffusion-3.5',
        'DALL·E 3': 'dalle-3',
        'GPT Image 1': 'gpt-image-1',
        'Imagen 4': 'imagen-4',
        'Imagen 3': 'imagen-3',
        'Imagen 3 Fast': 'imagen-3-fast',
        'Flux Pro 1.1 Ultra': 'flux-pro-1.1',
        'Flux Pro 1.1': 'flux-pro-1.1',
        'Flux Dev Redux': 'flux-dev-redux',
        'Flux Canny Pro': 'flux-canny-pro',
        'Flux Depth Pro': 'flux-depth-pro',
        'Ideogram V3': 'ideogram-v3',
        'Ideogram V2': 'ideogram-v2',
        'Minimax Image 01': 'minimax-image-01',
        'Minimax Image': 'minimax-image-01',
        'Recraft V3 SVG': 'recraft-v3-svg',
        'Image Upscale / Real-ESRGAN': 'esrgan',
        'Real-ESRGAN Video Upscaler': 'esrgan',
        'Bria': 'bria',
        'SD3 Remove Background': 'remove-background',
        'SD3 Content-Aware Fill': 'content-aware-fill',
        'Bria Remove Background': 'bria-remove-bg',
        'Bria Content-Aware Fill': 'bria-content-fill',
        'Replace Background': 'replace-background',
        'Bria Replace Background': 'bria-replace-background',
        'Relight 2.0': 'relight-2',
        'Kolors Virtual Try On': 'kolors-virtual-try-on',
        'Topaz Video Upscaler': 'topaz-video-upscaler',
        'Bria Upscale': 'bria-upscale',
        'Image Upscale / Clarity': 'clarity-upscale',
        'Runway Aleph': 'runway-aleph',
        'Runway Act-Two': 'runway-act-two',
        'Runway Gen-4': 'runway-gen-4',
        'Runway Gen-3': 'runway-gen-3',
        'Luma Reframe': 'luma-reframe',
        'Luma Modify': 'luma-modify',
        'Veo Text to Video': 'veo-text-to-video',
        'Veo Image to Video': 'veo-image-to-video',
        'Sora 2': 'sora-2',
        'Hunyuan Video to Video': 'hunyuan-video-to-video',
        'Video Smoother': 'video-smoother',
        'Increase Frame-rate': 'frame-interpolation',
        'Video to Audio': 'video-to-audio',
        'Audio to Video': 'audio-to-video',
        'Omnihuman V1.5': 'omnihuman-v1-5',
        'Sync 2 Pro': 'sync-2-pro',
        'Pixverse Lipsync': 'pixverse-lipsync',
        'Kling AI Avatar': 'kling-ai-avatar',
        'Rodin': 'rodin',
        'Hunyuan 3D': 'hunyuan-3d',
        'Trellis': 'trellis-3d',
        'Meshy': 'meshy-3d',
        'Wan Vace Depth': 'wan-vace-depth',
        'Wan Vace Pose': 'wan-vace-pose',
        'Wan Vace Reframe': 'wan-vace-reframe',
        'Wan Vace Outpaint': 'wan-vace-outpaint',
        'Wan 2.5': 'wan-2-5',
        'Wan 2.2': 'wan-2-2',
        'Wan2.1 With Lora': 'wan-2-1-lora',
      };
      const model = modelMap[modelLabel] || 'stable-diffusion-3.5';
      const workflowId = workflow?._id || roomId;
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: promptText, workflowId }),
      });
      const data = await res.json().catch(() => null);
      const outputUrl = (data && (data.output_url || data.url)) as string | undefined;
      if (outputUrl) {
        setOutputs((prev) => [{ url: outputUrl, model, prompt: promptText, ts: Date.now() }, ...prev].slice(0, 24));
        setOutputPanelOpen(true);
        const newNode: Node = {
          id: `node-${Date.now()}-result`,
          type: 'image',
          position: { x: Math.random() * 500, y: Math.random() * 400 },
          data: { label: 'Result', imageSrc: outputUrl, imageName: 'Result' },
        };
        setNodes([...nodes, newNode]);
      }
    } catch (e) {
      console.error('Run failed', e);
    }
  }, [nodes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const { type, label } = JSON.parse(data);
      if (!type || !label) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newNode: Node = {
        id: `node-${Date.now()}`,
        data: { label },
        position,
        type,
      };

      setNodes([...nodes, newNode]);
    } catch (error) {
      console.error('Error dropping node:', error);
    } finally {
      setIsDraggingOver(false);
    }
  }, [screenToFlowPosition, nodes, setNodes]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  }, []);

  // ===== Context Menu Handlers =====
  const openMenu = useCallback((e: React.MouseEvent, type: 'pane' | 'node', nodeId?: string) => {
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    const menuW = 260; const menuH = 320; const pad = 8;
    const xRaw = rect ? e.clientX - rect.left : e.clientX;
    const yRaw = rect ? e.clientY - rect.top : e.clientY;
    const x = rect ? Math.max(pad, Math.min(xRaw, rect.width - menuW - pad)) : xRaw;
    const y = rect ? Math.max(pad, Math.min(yRaw, rect.height - menuH - pad)) : yRaw;
    setContextMenu({ open: true, x, y, type, nodeId });
  }, []);

  const closeMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  // Listen to node-level context menu events dispatched from node components
  useEffect(() => {
    const handler = (e: Event) => {
      const { x, y, nodeId } = (e as CustomEvent<{ x: number; y: number; nodeId: string }>).detail || {};
      if (typeof x === 'number' && typeof y === 'number' && nodeId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        const menuW = 260; const menuH = 320; const pad = 8;
        const xRaw = rect ? x - rect.left : x;
        const yRaw = rect ? y - rect.top : y;
        const xPos = rect ? Math.max(pad, Math.min(xRaw, rect.width - menuW - pad)) : xRaw;
        const yPos = rect ? Math.max(pad, Math.min(yRaw, rect.height - menuH - pad)) : yRaw;
        setContextMenu({ open: true, x: xPos, y: yPos, type: 'node', nodeId });
      }
    };
    window.addEventListener('karate-node-contextmenu', handler as EventListener);
    return () => window.removeEventListener('karate-node-contextmenu', handler as EventListener);
  }, []);

  const addNodeAtMenu = useCallback((type: string, label: string) => {
    if (!contextMenu) return;
    const position = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
    const newNode: Node = { id: `node-${Date.now()}`, data: { label }, position, type };
    setNodes([...nodes, newNode]);
    closeMenu();
  }, [contextMenu, screenToFlowPosition, nodes, setNodes, closeMenu]);

  const deleteNodeById = useCallback((id?: string) => {
    if (!id) return;
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.source !== id && e.target !== id));
    closeMenu();
  }, [nodes, edges, setNodes, setEdges, closeMenu]);

  const duplicateNodeById = useCallback((id?: string) => {
    if (!id) return;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const copy: Node = {
      ...node,
      id: `node-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
    } as Node;
    setNodes([...nodes, copy]);
    closeMenu();
  }, [nodes, setNodes, closeMenu]);

  const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, data: { ...(n.data || {}), ...patch } } : n)));
  }, [nodes, setNodes]);

  // ===== Assistant: Parse a natural language instruction and build a small flow
  const addWorkflowFromPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setAgentBusy(true);
    try {
      const t = text.toLowerCase();
      const planned: { type: string; label: string }[] = [];
      // Seed with a prompt/input if user mentions prompt or any gen model
      if (/prompt|describe|write/.test(t)) planned.push({ type: 'prompt', label: 'Prompt' });

      // Models
      const pushIf = (cond: boolean, label: string, type: string = 'stableDiffusion') => { if (cond) planned.push({ type, label }); };
      // Include Stable Diffusion 3.5 (image) as an option
      pushIf(/stable diff|sd\s*3\.5/.test(t), 'Stable Diffusion 3.5');
      pushIf(/gpt\s*image|gpt img/.test(t), 'GPT Image 1');
      pushIf(/imagen\s*4/.test(t), 'Imagen 4');
      pushIf(/imagen\s*3/.test(t), 'Imagen 3');
      pushIf(/flux pro|flux\s*1\.1/.test(t), 'Flux Pro 1.1 Ultra');
      pushIf(/dalle|dal\s*e/.test(t), 'DALL·E 3');

      // Tools
      const toolIf = (cond: boolean, label: string, type: string) => { if (cond) planned.push({ type, label }); };
      toolIf(/remove background|bg remove/.test(t), 'Remove Background', 'image');
      toolIf(/replace background/.test(t), 'Replace Background', 'image');
      toolIf(/content[- ]?aware|fill\b/.test(t), 'Content-Aware Fill', 'image');
      toolIf(/inpaint|fix area/.test(t), 'Inpaint', 'inpaint');
      toolIf(/upscale|increase resolution|enhance/.test(t), 'Upscale', 'upscale');
      toolIf(/upload|source image/.test(t), 'Image Upload', 'imageUpload');

      if (planned.length === 0) {
        // Fallback sensible chain with Stable Diffusion image model
        planned.push({ type: 'prompt', label: 'Prompt' });
        planned.push({ type: 'stableDiffusion', label: 'Stable Diffusion 3.5' });
      }

      // Layout new nodes
      const startX = 240 + Math.random() * 80;
      const startY = 240 + Math.random() * 40;
      const spacingX = 280;
      const created: Node[] = planned.map((p, idx) => ({
        id: `node-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,7)}`,
        type: p.type,
        position: { x: startX + idx * spacingX, y: startY },
        data: { label: p.label },
      }));

      const newEdges: Edge[] = created.slice(1).map((n, i) => ({
        id: `edge-${created[i].id}-${n.id}`,
        source: created[i].id,
        target: n.id,
        sourceHandle: 'source',
        targetHandle: 'target',
        animated: true,
      }));

      setNodes([...nodes, ...created]);
      setEdges([...edges, ...newEdges]);
    } finally {
      setAgentBusy(false);
      setAgentInput('');
    }
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div className="h-screen w-screen flex bg-white text-zinc-900 dark:bg-black dark:text-white">
      {/* Icon Rail */}
      <div className="w-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-4 py-6">
        {(() => {
          const availableCategories = Array.from(new Set([...models, ...tools].map((i) => i.category)));
          const categoryForIcon = (key: string) => {
            const prefs: Record<string, string[]> = {
              models: ['Image Gen', 'Video Gen', '3D', 'Advanced'],
              tools: ['Edit', 'Background', 'Image Enhance', 'Graphics', 'Face', 'Control'],
              helpers: ['Helpers'],
            };
            const candidates = prefs[key] || [];
            return candidates.find((c) => availableCategories.includes(c));
          };
          const iconKeyForCategory = (cat: string) => {
            if (['Image Gen','Video Gen','3D','Advanced'].includes(cat)) return 'models';
            if (['Edit','Background','Image Enhance','Graphics','Face','Control'].includes(cat)) return 'tools';
            if (cat === 'Helpers') return 'helpers';
            return undefined;
          };
          const activeRailKey = railManualKey || iconKeyForCategory(activeCategory || '');

          // Three primary buttons: Models, Tools, Primary Tools (Helpers)
          const railItems = [
            { key: 'models', icon: <ViewInArIcon />, label: 'Models', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('models'); setRailManualKey('models'); onRequestScrollToCategory(categoryForIcon('models') || 'Image Gen'); } },
            { key: 'tools', icon: <HandymanIcon />, label: 'Tools', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('tools'); setRailManualKey('tools'); onRequestScrollToCategory(categoryForIcon('tools') || 'Edit'); } },
            { key: 'helpers', icon: <CloudUploadIcon />, label: 'Primary Tools', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('tools'); setRailManualKey('helpers'); onRequestScrollToCategory('Helpers'); } },
          ];

          return (
            <>
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  sidebarOpen ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>

              {railItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => item.onClick()}
                  className={`w-10 h-10 rounded-lg transition-all flex items-center justify-center ${
                    activeRailKey === item.key
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-yellow-400'
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.label}
                >
                  {item.icon}
                </motion.button>
              ))}
            </>
          );
        })()}
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        models={models}
        tools={tools}
        externalActiveTab={sidebarTabLocal}
        focusSearchSignal={focusSearchSignal}
        onActiveCategoryChange={onActiveCategoryChange}
        scrollToCategory={scrollToCategory}
        onConsumeScrollToCategory={onConsumeScrollToCategory}
        onAddNode={(type: string, label: string) => {
          const newNode: Node = {
            id: `node-${Date.now()}`,
            data: { label },
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            type,
          };
          setNodes([...nodes, newNode]);
          setSidebarOpen(false);
        }}
      />

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black">
        {/* Top Bar */}
        <motion.header
          className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="font-semibold text-white">My First Flow</span>
            <span>•</span>
            <span>{nodes.length} nodes</span>
            <span>•</span>
            <span>{edges.length} connections</span>
            {selectedTool && (
              <>
                <span>•</span>
                <span className="text-yellow-400">{selectedTool}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Compact horizontal control group styled like zoom controls */}
            <div className="flex items-center gap-1 bg-zinc-900/70 border border-zinc-700 rounded-md p-1">
              <button
                onClick={() => setShowMinimap((v) => !v)}
                className={`w-8 h-8 rounded-md border ${showMinimap ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'} flex items-center justify-center`}
                title="Minimap"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="6" rx="1"/><rect x="13" y="3" width="8" height="10" rx="1"/><rect x="3" y="11" width="8" height="10" rx="1"/></svg>
              </button>
              <button
                onClick={() => setSnapToGrid((v) => !v)}
                className={`w-8 h-8 rounded-md border ${snapToGrid ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'} flex items-center justify-center`}
                title="Snap to grid"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3V3zm7 0h4v4h-4V3zm7 0h4v4h-4V3zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 17h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4z"/></svg>
              </button>
              <button
                className="w-8 h-8 rounded-md border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white flex items-center justify-center"
                title="Undo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l-4-4 4-4v3c5.523 0 10 4.477 10 10h-2a8 8 0 00-8-8z"/></svg>
              </button>
              <button
                className="w-8 h-8 rounded-md border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white flex items-center justify-center"
                title="Redo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v3l4-4-4-4v3a10 10 0 00-10 10h2a8 8 0 018-8z"/></svg>
              </button>
            </div>

            {/* Action buttons */}
            <Tooltip title="Run workflow">
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
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
                onClick={() => setOutputPanelOpen((v) => !v)}
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
          </div>
        </motion.header>

        {/* Canvas */}
        <div
          className="flex-1 bg-white dark:bg-black relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onContextMenu={(e) => openMenu(e, 'pane')}
          ref={canvasRef}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes as unknown as NodeTypes}
            onNodeContextMenu={(event, node) => {
              // prevent pane menu from opening when node menu should open
              openMenu(event, 'node', node.id);
            }}
            fitView
            snapToGrid={snapToGrid}
            snapGrid={[12, 12]}
            className="w-full h-full"
          >
            {/* Theme-aware grid dots: ~20% opacity in dark mode */}
            <Background color={isDark ? 'rgba(255,255,255,0.20)' : '#e5e7eb'} gap={12} size={0.8} />
            <Controls showInteractive={true} showFitView={true} showZoom={true} position="bottom-left" />
            {showMinimap && <MiniMap nodeColor="#999" maskColor="rgba(0,0,0,0.2)" />}            
          </ReactFlow>
          {/* Right Output Panel */}
          {outputPanelOpen && (
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-zinc-900/95 border-l border-zinc-200 dark:border-zinc-800 backdrop-blur z-30">
              <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-sm font-semibold">Outputs</div>
                <button className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setOutputs([])}>Clear</button>
              </div>
              <div className="h-[calc(100%-56px)] overflow-y-auto p-3 space-y-3">
                {outputs.length === 0 ? (
                  <div className="text-xs text-zinc-500">No outputs yet. Click Run to generate.</div>
                ) : (
                  outputs.map((o) => (
                    <div key={o.ts} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
                        <img src={o.url} alt="output" className="object-cover w-full h-full" />
                      </div>
                      <div className="p-2 text-[11px] text-zinc-500">
                        <div className="truncate"><span className="text-zinc-400">Model:</span> {o.model}</div>
                        <div className="truncate"><span className="text-zinc-400">Prompt:</span> {o.prompt}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {/* Minimalist Drag Indicator */}
          {isDraggingOver && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Subtle background overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-cyan-400/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              
              {/* Center indicator card */}
              <motion.div
                className="relative bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 backdrop-blur-md border border-yellow-400/30 rounded-xl px-6 py-4 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="text-center space-y-2">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ⬇️
                  </motion.div>
                  <p className="text-yellow-300/80 font-medium text-sm">Drop to add node</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Context Menu */}
          {contextMenu?.open && (
            <div
              className="absolute z-50 min-w-[220px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-xl"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={() => setTimeout(() => closeMenu(), 200)}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {contextMenu.type === 'node' ? (
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => duplicateNodeById(contextMenu.nodeId)}>Duplicate</button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => deleteNodeById(contextMenu.nodeId)}>Delete</button>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setSnapToGrid((v)=>!v)}>{snapToGrid ? 'Disable' : 'Enable'} Snap</button>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => { setSettingsNodeId(contextMenu.nodeId || null); closeMenu(); }}>Settings…</button>
                </div>
              ) : (
                <div className="p-1">
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-zinc-500">Add model</div>
                  <div className="grid grid-cols-2 gap-1 px-1 pb-2">
                    {models.slice(0,6).map((m) => (
                      <button key={m.name} className="text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm" onClick={() => addNodeAtMenu(m.type, m.name)}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-zinc-500">Add tool</div>
                  <div className="grid grid-cols-2 gap-1 px-1 pb-2">
                    {tools.slice(0,6).map((t) => (
                      <button key={t.name} className="text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm" onClick={() => addNodeAtMenu(t.type, t.name)}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lightweight node settings popover */}
          {settingsNodeId && (
            <div className="absolute z-50 right-4 top-16 w-[300px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Node Settings</div>
                <button className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => setSettingsNodeId(null)}>Close</button>
              </div>
              <div className="space-y-3">
                <label className="block text-xs text-zinc-500">Label</label>
                <input className="w-full text-xs p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded" onChange={(e) => updateNodeData(settingsNodeId, { label: e.target.value })} placeholder="Custom label" />
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-2 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => duplicateNodeById(settingsNodeId)}>Duplicate</button>
                  <button className="px-2 py-2 text-xs border border-red-300 text-red-600 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => deleteNodeById(settingsNodeId)}>Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* Assistant Dock */}
          <AnimatePresence initial={false}>
            {!agentHidden && (
              <motion.div
                className="absolute z-40 w-full px-4"
                style={{ left: 0, right: 0, bottom: `calc(env(safe-area-inset-bottom) + 16px)` }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
              >
                <div className="context-panel mx-auto w-full max-w-[980px] overflow-hidden">
                  <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      className={`w-8 h-8 rounded-md border flex items-center justify-center ${agentOpen ? 'border-yellow-400 text-yellow-300' : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'}`}
                      onClick={() => setAgentOpen(!agentOpen)}
                      title={agentOpen ? 'Collapse' : 'Expand'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${agentOpen ? 'rotate-180' : ''}`}> 
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    <div className="text-xs text-zinc-500 flex-1 px-2">Ask the AI to build steps for you</div>
                    <button className="w-8 h-8 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-300 flex items-center justify-center" onClick={() => setAgentHidden(true)} title="Hide bar">—</button>
                  </div>

                  <AnimatePresence initial={false}>
                    {agentOpen && (
                      <motion.div
                        key="agent-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-2">
                          <input
                            className="flex-1 context-search agent-input"
                            placeholder="Create workflows with natural language, e.g., upload an image, remove background, then upscale 4×"
                              value={agentInput}
                              onChange={(e) => setAgentInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') addWorkflowFromPrompt(agentInput); }}
                            />
                            <button
                              onClick={() => addWorkflowFromPrompt(agentInput)}
                              disabled={agentBusy}
                              className={`btn-primary px-4 ${agentBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {agentBusy ? 'Thinking…' : 'Generate'}
                            </button>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-2">
                            Tip: mention models like "Stable Diffusion 3.5" or tools like "remove background", "inpaint", "upscale".
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reopen FAB when hidden */}
          {agentHidden && (
            <button
              className="absolute z-40" style={{ right: '24px', bottom: `calc(env(safe-area-inset-bottom) + 24px)` }}
              onClick={() => { setAgentHidden(false); setAgentOpen(true); }}
              title="Open AI assistant"
            >
              <div className="rounded-full w-10 h-10 bg-zinc-900/80 dark:bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center shadow-lg">
                🤖
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}


