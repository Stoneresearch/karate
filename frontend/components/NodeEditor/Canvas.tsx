import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
import '@xyflow/react/dist/style.css';
import { useWorkflow } from '../Realtime/Collaboration';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Button, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  StableDiffusionNode,
  ImageNode,
  TextNode,
  UpscaleNode,
  InpaintNode,
  PromptNode,
  ImageUploadNode,
} from './NodeTypes';

const nodeTypes = {
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

  // Models and tools data
  const models = [
    { name: 'Stable Diffusion 3.5', type: 'stableDiffusion', icon: '🎨', symbol: 'SD', category: 'Image Gen', brand: 'Stability', logo: 'https://logo.clearbit.com/stability.ai' },
    { name: 'GPT Image 1', type: 'stableDiffusion', icon: '🧠', symbol: 'GPT', category: 'Image Gen', brand: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com' },
    { name: 'Imagen 4', type: 'stableDiffusion', icon: '🅶', symbol: 'G', category: 'Image Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
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
    { name: 'Veo Text to Video', type: 'stableDiffusion', icon: '📝', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Veo Image to Video', type: 'stableDiffusion', icon: '🖼️', symbol: 'VEO', category: 'Video Gen', brand: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Sora 2', type: 'stableDiffusion', icon: '🎥', symbol: 'SR', category: 'Video Gen', brand: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com' },
    { name: 'Hunyuan Video to Video', type: 'stableDiffusion', icon: '🎥', symbol: 'HY', category: 'Video Gen', brand: 'Hunyuan', logo: 'https://logo.clearbit.com/tencent.com' },
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

  const tools = [
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
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  models: any[];
  tools: any[];
  addNode: (type: string, label: string) => void;
  activeCategory: string;
  onRequestScrollToCategory: (category?: string) => void;
  onActiveCategoryChange?: (category: string) => void;
  scrollToCategory?: string;
  onConsumeScrollToCategory?: () => void;
  focusSearchSignal?: number;
  onSearchRequested?: () => void;
  externalActiveTab?: 'models' | 'tools';
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
}: CanvasContentProps) {
  const { workflow, updateWorkflow } = useWorkflow(roomId);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const [railManualKey, setRailManualKey] = useState<string | undefined>(undefined);
  const [sidebarTabLocal, setSidebarTabLocal] = useState<'models' | 'tools'>(externalActiveTab || 'models');
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
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
  }, [workflow?.id]);

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
        updateWorkflow({ id: roomId as any, nodes });
      }
      if (edges.length >= 0) {
        updateWorkflow({ id: roomId as any, edges });
      }
    }, 1000);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, edges, roomId, updateWorkflow]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
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

  return (
    <div className="h-screen w-screen flex bg-black text-white">
      {/* Icon Rail */}
      <div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center gap-4 py-6">
        {(() => {
          const availableCategories = Array.from(new Set([...models, ...tools].map((i: any) => i.category)));
          const categoryForIcon = (key: string) => {
            const prefs: Record<string, string[]> = {
              images: ['Image Gen', 'Image Enhance', 'Background', 'Edit', 'Graphics', 'Face', 'Control'],
              video: ['Video Gen', 'Video Enhance'],
              threeD: ['3D'],
              effects: ['Advanced'],
              assets: ['Helpers'],
            };
            const candidates = prefs[key] || [];
            return candidates.find((c) => availableCategories.includes(c));
          };
          const iconKeyForCategory = (cat: string) => {
            if (['Image Gen','Image Enhance','Background','Edit','Graphics','Face','Control'].includes(cat)) return 'images';
            if (['Video Gen','Video Enhance'].includes(cat)) return 'video';
            if (cat === '3D') return 'threeD';
            if (cat === 'Advanced') return 'effects';
            return undefined;
          };
          const activeRailKey = railManualKey || iconKeyForCategory(activeCategory || '');

          const railItems = [
            { key: 'search', icon: <SearchIcon />, label: 'Search', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('models'); setRailManualKey('images'); onSearchRequested && onSearchRequested(); onRequestScrollToCategory('Image Gen'); } },
            { key: 'undo', icon: <UndoIcon />, label: 'Undo', onClick: () => {} },
            { key: 'assets', icon: <ImageIcon />, label: 'Media', onClick: () => {
              try {
                (window as any).location ? (window.location.href = '/dashboard') : null;
              } catch {}
              setRailManualKey('assets');
            } },
            { key: 'images', icon: <ImageIcon />, label: 'Models', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('models'); setRailManualKey('images'); onRequestScrollToCategory(categoryForIcon('images') || 'Image Gen'); } },
            { key: 'video', icon: <VideoLibraryIcon />, label: 'Tools', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('tools'); setRailManualKey('video'); onRequestScrollToCategory(categoryForIcon('video') || 'Video Gen'); } },
            { key: 'threeD', icon: <ViewInArIcon />, label: '3D', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('models'); setRailManualKey('threeD'); onRequestScrollToCategory(categoryForIcon('threeD') || '3D'); } },
            { key: 'effects', icon: <StarIcon />, label: 'Advanced', onClick: () => { setSidebarOpen(true); setSidebarTabLocal('models'); setRailManualKey('effects'); onRequestScrollToCategory(categoryForIcon('effects') || 'Advanced'); } },
            { key: 'settings', icon: <SettingsIcon />, label: 'Settings', onClick: () => { try { (window as any).location ? (window.location.href = '/docs') : null; } catch {} setRailManualKey('settings'); } },
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
      <div className="flex-1 flex flex-col bg-black">
        {/* Top Bar */}
        <motion.header
          className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6"
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

            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300 ml-2">
              U
            </div>
          </div>
        </motion.header>

        {/* Canvas */}
        <div
          className="flex-1 bg-black relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            nodeTypes={nodeTypes as any}
            fitView
            snapToGrid={snapToGrid}
            snapGrid={[12, 12]}
            className="w-full h-full"
          >
            <Background color="#1a1a1a" gap={12} size={1} />
            <Controls showInteractive={true} showFitView={true} showZoom={true} position="bottom-left" />
            {showMinimap && <MiniMap nodeColor="#999" maskColor="rgba(0,0,0,0.2)" />}            
          </ReactFlow>
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

        </div>
      </div>
    </div>
  );
}


