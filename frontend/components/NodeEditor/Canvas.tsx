"use client";
import { useCallback, useState, useEffect, useRef, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { MODELS, TOOLS } from '../../lib/models';
import { useWorkflow } from '../Realtime/Collaboration';
import Sidebar from './Sidebar';
import EditorHeader from './EditorHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import PhotoIcon from '@mui/icons-material/Photo';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import HandymanIcon from '@mui/icons-material/Handyman';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BrushIcon from '@mui/icons-material/Brush';
import SettingsIcon from '@mui/icons-material/Settings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsPanel from './SettingsPanel';
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
type OutputItem = { url: string; model: string; prompt: string; ts: number; error?: string };

type CanvasProps = { roomId: string };

export default function Canvas({ roomId }: CanvasProps) {
  const router = useRouter(); // currently used only for future deep-linking; kept for expansion
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [scrollToCategory, setScrollToCategory] = useState<string | undefined>(undefined);
  const [focusSearchSignal, setFocusSearchSignal] = useState<number>(0);
  const [sidebarTab] = useState<'models' | 'tools'>('models');
  const [outputPanelOpen, setOutputPanelOpen] = useState<boolean>(false);
  const [outputs, setOutputs] = useState<OutputItem[]>([]);

  // Models and tools data
  const models = MODELS;
  const tools = TOOLS;

  const pollStatus = async (taskId: string, runId?: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30s timeout for client-side polling
    
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        try {
            const res = await fetch(`/api/status?taskId=${taskId}&runId=${runId || ''}`);
            if (!res.ok) continue;
            const data = await res.json();
            
            if (data.status === 'completed') {
                return data;
            } else if (data.status === 'failed') {
                throw new Error(data.error || 'Task failed');
            }
            // else: processing, continue
        } catch (e) {
            console.warn('Poll error:', e);
        }
        attempts++;
    }
    throw new Error('Timeout waiting for result');
  };

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
        onActiveCategoryChange={(cat: string) => {
          setActiveCategory(cat);
        }}
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
  setNodes: Dispatch<SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  models: PaletteItem[];
  tools: PaletteItem[];
  addNode: (type: string, label: string, logo?: string) => void;
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
  const { user } = useUser();
  const router = useRouter(); // Add router here
  const { resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || 'dark') === 'dark';
  const { workflow, updateWorkflow } = useWorkflow(roomId);
  const [selectedTool] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
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
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'billing'>('general');
  
  // Processing state for visual indicator
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const workflowId = useMemo(
    () => (workflow && (workflow as { _id?: string })._id) || roomId,
    [workflow, roomId]
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    if (workflowId) {
      updateWorkflow({ title: newTitle });
    }
  }, [workflowId, updateWorkflow]);

  useEffect(() => {
    if (externalActiveTab) setSidebarTabLocal(externalActiveTab);
  }, [externalActiveTab]);

  // Sync with Convex workflow on load only (to prevent fighting with local state)
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!loadedRef.current && workflow?.nodes) {
      setNodes(workflow.nodes as Node[]);
      setEdges((workflow.edges || []) as Edge[]);
      loadedRef.current = true;
    }
  }, [workflow, setNodes, setEdges]);

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
  }, [nodes, edges, updateWorkflow]);

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

  const pollStatus = useCallback(async (taskId: string, runId?: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30s timeout for client-side polling
    
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        try {
            const res = await fetch(`/api/status?taskId=${taskId}&runId=${runId || ''}`);
            if (!res.ok) continue;
            const data = await res.json();
            
            if (data.status === 'completed') {
                return data;
            } else if (data.status === 'failed') {
                throw new Error(data.error || 'Task failed');
            }
            // else: processing, continue
        } catch (e) {
            console.warn('Poll error:', e);
        }
        attempts++;
    }
    throw new Error('Timeout waiting for result');
  }, []);

  // Minimal run handler: extract first prompt and first model label
  const handleRun = useCallback(async (targetNodeId?: string) => {
    setIsProcessing(true);
    
    // Find ALL relevant nodes (not just the first one)
    const promptNodes = nodes.filter((n) => n.type === 'prompt');
    
    let targetModelNode = null;
    if (targetNodeId) {
        targetModelNode = nodes.find(n => n.id === targetNodeId);
    }
    
    if (!targetModelNode) {
        const modelNodes = nodes.filter((n) => n.type === 'stableDiffusion');
        if (modelNodes.length > 0) {
            targetModelNode = modelNodes[0];
        }
    }
    
    if (!targetModelNode) {
        console.warn("No model node found to run.");
        setIsProcessing(false);
        return;
    }

    // Update the node UI to show loading state
    setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'processing', error: undefined, output: undefined } } : n));
    
    try {
      // Logic to find connected prompt node if specific one exists
      let specificPromptNode = null;
      if (targetNodeId) {
          const incomingEdges = edges.filter(e => e.target === targetNodeId);
          const incomingNodeIds = incomingEdges.map(e => e.source);
          specificPromptNode = nodes.find(n => incomingNodeIds.includes(n.id) && n.type === 'prompt');
      }

      // Fallback to first available prompt node if no direct connection found
      const promptNode = specificPromptNode || promptNodes[0]; 
      const promptData = (promptNode?.data ?? {}) as { prompt?: string; label?: string };
      const modelData = (targetModelNode?.data ?? {}) as { 
        label?: string; 
        prompt?: string;
        aspect_ratio?: string;
        guidance_scale?: number;
        output_format?: string;
        safety_tolerance?: number;
        seed?: number;
      };
      
      // Prefer the prompt from the model node itself if set, otherwise fallback to connected prompt node
      // Logic: Model Node Internal Prompt > Connected Prompt Node > Label fallback
      const promptText = modelData.prompt || promptData.prompt || promptData.label || 'Generate an image';
      const modelLabel = modelData.label || 'Stable Diffusion 3.5';
      
      // Gather extra parameters
      const inputParams = {
        aspect_ratio: modelData.aspect_ratio,
        guidance_scale: modelData.guidance_scale,
        output_format: modelData.output_format,
        safety_tolerance: modelData.safety_tolerance,
        seed: modelData.seed,
      };

      const modelMap: Record<string, string> = {
        'Stable Diffusion 3.5': 'stable-diffusion-3.5',
        'DALL·E 3': 'dalle-3',
        'GPT Image 1': 'gpt-image-1',
        'Imagen 4': 'imagen-4',
        'Imagen 3': 'imagen-3',
        'Imagen 3 Fast': 'imagen-3-fast',
        'Flux Pro 1.1 Ultra': 'flux-pro-1.1-ultra',
        'Flux Pro 1.1': 'flux-pro-1.1',
        'Flux Dev Redux': 'flux-dev-redux',
        'Flux Canny Pro': 'flux-canny-pro',
        'Flux Depth Pro': 'flux-depth-pro',
        'Ideogram V3': 'ideogram-v3',
        'Ideogram V2': 'ideogram-v2',
        'Minimax Image': 'minimax-image-01',
        'Recraft V3 SVG': 'recraft-v3-svg',
        'Image Upscale / Real-ESRGAN': 'esrgan',
        'Bria': 'bria',
        'Wan 2.5': 'wan-2.5-t2v',
        'Wan 2.2': 'wan-2.2-t2v',
        'Hunyuan Video to Video': 'hunyuan-video',
        'Hunyuan 3D': 'hunyuan-3d',
        'Trellis': 'trellis',
        'Meshy': 'meshy',
        'Rodin': 'rodin',
      };
      const model = modelMap[modelLabel] || modelLabel.toLowerCase().replace(/\s+/g, '-');
      
      // Call API
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            model, 
            prompt: promptText, 
            workflowId,
            email: user?.primaryEmailAddress?.emailAddress,
            ...inputParams 
        }),
      });
      const data = await res.json().catch(() => null);
      
      if (data && data.error) {
        // Show error in outputs
        setOutputs((prev) => [{ 
            url: '', 
            model, 
            prompt: promptText, 
            ts: Date.now(),
            error: data.detail || data.error 
        }, ...prev].slice(0, 24));
        setOutputPanelOpen(true);
        
        // Update node status to error
        setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'error', error: data.detail || data.error } } : n));
        return;
      }

      let outputUrl = (data && (data.output_url || data.url)) as string | undefined;
      
      // If we got a task_id but no outputUrl, start polling
      if (!outputUrl && data && data.task_id) {
          try {
             const pollResult = await pollStatus(data.task_id, data.run_id);
             outputUrl = pollResult.output_url || pollResult.url;
          } catch (pollErr) {
             const msg = String(pollErr);
             setOutputs((prev) => [{ 
                url: '', 
                model, 
                prompt: promptText, 
                ts: Date.now(),
                error: msg 
            }, ...prev].slice(0, 24));
            setOutputPanelOpen(true);
             setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'error', error: msg } } : n));
        return;
          }
      }

      if (outputUrl) {
        setOutputs((prev) => [{ url: outputUrl!, model, prompt: promptText, ts: Date.now() }, ...prev].slice(0, 24));
        setOutputPanelOpen(true);
        
        // Update node status to success and show output
        setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'completed', output: outputUrl } } : n));
      } else {
         // Fallback generic error
         const errMsg = "Unknown error occurred";
         setOutputs((prev) => [{ 
            url: '', 
            model, 
            prompt: promptText, 
            ts: Date.now(),
            error: errMsg
        }, ...prev].slice(0, 24));
        setOutputPanelOpen(true);
        
        setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'error', error: errMsg } } : n));
      }
    } catch (e) {
      console.error('Run failed', e);
      const errMsg = String(e);
      setOutputs((prev) => [{ 
            url: '', 
            model: 'System', 
            prompt: 'System Error', 
            ts: Date.now(),
            error: errMsg
        }, ...prev].slice(0, 24));
        setOutputPanelOpen(true);
        
        if (targetModelNode) {
            setNodes((nds: Node[]) => nds.map((n: Node) => n.id === targetModelNode!.id ? { ...n, data: { ...n.data, status: 'error', error: errMsg } } : n));
        }
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, workflowId, setNodes, setOutputs, setOutputPanelOpen, pollStatus, user]);

  // Listen to node-run events
  useEffect(() => {
    const handler = (e: Event) => {
      const { nodeId } = (e as CustomEvent<{ nodeId: string }>).detail || {};
      if (nodeId) {
        handleRun(nodeId);
      }
    };
    window.addEventListener('karate-run-node', handler as EventListener);
    return () => window.removeEventListener('karate-run-node', handler as EventListener);
  }, [handleRun]);

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
    <div className="h-screen w-screen flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-white">
      {/* Top Bar */}
      <EditorHeader
        workflowTitle={workflow?.title || 'My First Flow'}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        selectedTool={selectedTool}
        showMinimap={showMinimap}
        snapToGrid={snapToGrid}
        outputPanelOpen={outputPanelOpen}
        isProcessing={isProcessing}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        onToggleGrid={() => setSnapToGrid((v) => !v)}
        onToggleOutputs={() => setOutputPanelOpen((v) => !v)}
        onRun={handleRun}
        onUndo={() => { /* Todo */ }}
        onRedo={() => { /* Todo */ }}
        onTitleChange={handleTitleChange}
      />

      <div className="flex flex-1">
        {/* Icon Rail */}
        <div className="w-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-4 py-6">
          {(() => {
            const availableCategories = Array.from(
              new Set([...models, ...tools].map((i) => i.category)),
            );
            const categoryForIcon = (key: string) => {
                  // Map rail key to category names
                  const map: Record<string, string[]> = {
                    image: ['Image Gen', 'Advanced'],
                    video: ['Video Gen', 'Video Enhance', 'Lip Sync'],
                    audio: ['Audio Gen'],
                    threeD: ['3D'],
                tools: ['Edit', 'Background', 'Image Enhance', 'Graphics', 'Face', 'Control'],
                helpers: ['Helpers'],
              };
                  return map[key]?.find(c => availableCategories.includes(c));
                };

                const activeRailKey = (() => {
                    if (['Image Gen', 'Advanced'].includes(activeCategory)) return 'image';
                    if (['Video Gen', 'Video Enhance', 'Lip Sync'].includes(activeCategory)) return 'video';
                    if (['Audio Gen'].includes(activeCategory)) return 'audio';
                    if (['3D'].includes(activeCategory)) return 'threeD';
                    if (['Edit', 'Background', 'Image Enhance', 'Graphics', 'Face', 'Control'].includes(activeCategory)) return 'tools';
                    if (activeCategory === 'Helpers') return 'helpers';
              return undefined;
                })();

            const railItems = [
              {
                    key: 'image',
                    icon: <PhotoIcon />,
                    label: 'Image Generation',
                    targetTab: 'models',
                    targetCat: 'Image Gen',
                  },
                  {
                    key: 'video',
                    icon: <MovieIcon />,
                    label: 'Video Generation',
                    targetTab: 'models',
                    targetCat: 'Video Gen',
                  },
                  {
                    key: 'audio',
                    icon: <AudiotrackIcon />,
                    label: 'Audio Generation',
                    targetTab: 'models',
                    targetCat: 'Audio Gen',
                  },
                  {
                    key: 'threeD',
                    icon: <ViewInArIcon />,
                    label: '3D Models',
                    targetTab: 'models',
                    targetCat: '3D',
                  },
                  {
                    key: 'tools',
                    icon: <BrushIcon />, // Changed from Handyman for "Tools"
                    label: 'Editing Tools',
                    targetTab: 'tools',
                    targetCat: 'Edit',
              },
              {
                key: 'helpers',
                icon: <CloudUploadIcon />,
                    label: 'Files & Assets',
                    targetTab: 'models', // Fix: 'Helpers' are in 'models' in models array
                    targetCat: 'Helpers',
              },
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
                    onClick={() => {
                        if (!sidebarOpen) setSidebarOpen(true);
                        setSidebarTabLocal(item.targetTab as 'models' | 'tools');
                        // Find first available category matching the group
                        const cat = categoryForIcon(item.key) || item.targetCat;
                        onRequestScrollToCategory(cat);
                    }}
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

                {/* Re-open AI assistant when hidden, as part of the rail */}
                {agentHidden && (
                  <motion.button
                    onClick={() => {
                      setAgentHidden(false);
                      setAgentOpen(true);
                    }}
                    className="mt-auto w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-900 text-zinc-200 border border-zinc-700 hover:border-yellow-400 hover:text-yellow-300 transition-all"
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    title="Open AI assistant"
                  >
                    🤖
                  </motion.button>
                )}

                {/* Billing Button */}
                <motion.button
                  onClick={() => {
                    setSettingsTab('billing');
                    setSettingsPanelOpen(true);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white ${
                    !agentHidden ? 'mt-auto' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Credits & Billing"
                >
                  <CreditCardIcon className="w-5 h-5" />
                </motion.button>

                {/* User Settings Button */}
                <motion.button
                  onClick={() => {
                    setSettingsTab('general');
                    setSettingsPanelOpen(true);
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </motion.button>
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
          onAddNode={(type: string, label: string, logo?: string) => {
            const newNode: Node = {
              id: `node-${Date.now()}`,
              data: { label, logo },
              position: { x: Math.random() * 500, y: Math.random() * 500 },
              type,
            };
            setNodes([...nodes, newNode]);
            setSidebarOpen(false);
          }}
        />

        {/* Canvas Area */}
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
          {/* Custom connection line styling (handled via CSS or internal RF props, 
              but for 'hover' effect on handles, we use CSS in globals.css or styled handles) 
           */}
           <style jsx global>{`
             .react-flow__handle:hover {
               background-color: #fbbf24 !important; /* yellow-400 */
               transform: scale(1.2);
               transition: transform 0.1s;
               border-color: #fff;
             }
             .react-flow__handle-connecting {
               background-color: #fbbf24 !important;
             }
           `}</style>
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
                    <div key={o.ts} className={`border rounded-lg overflow-hidden ${o.error ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-200 dark:border-zinc-800'}`}>
                      {o.error ? (
                        <div className="p-4 flex flex-col items-center text-center gap-2 text-red-400">
                          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                          <p className="text-xs font-medium">Generation Failed</p>
                          <p className="text-[10px] opacity-80">{o.error}</p>
                        </div>
                      ) : (
                        <div className="relative aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
                          <Image src={o.url} alt="output" fill className="object-cover" />
                        </div>
                      )}
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
                        <div className="p-4">
                          <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1.5 pl-4 focus-within:border-zinc-700 focus-within:bg-zinc-900 transition-all">
                            <input
                              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-600 font-medium"
                              placeholder="Describe your workflow, e.g. 'remove background from image then upscale it 4x'..."
                              value={agentInput}
                              onChange={(e) => setAgentInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') addWorkflowFromPrompt(agentInput); }}
                            />
                            <button
                              onClick={() => addWorkflowFromPrompt(agentInput)}
                              disabled={agentBusy}
                              className={`h-9 px-6 rounded-xl bg-gradient-to-r from-yellow-300 to-cyan-300 text-black font-bold text-sm shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${agentBusy ? 'opacity-60 cursor-not-allowed grayscale' : ''}`}
                            >
                              {agentBusy ? 'Building...' : 'Generate'}
                            </button>
                          </div>
                          <div className="text-[10px] text-zinc-600 mt-2 px-2 font-medium">
                            <span className="text-zinc-500">Pro tip:</span> You can mention specific models like &quot;Stable Diffusion 3.5&quot; or tools like &quot;Inpaint&quot;.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SettingsPanel isOpen={settingsPanelOpen} onClose={() => setSettingsPanelOpen(false)} defaultTab={settingsTab} />
    </div>
  );
}
