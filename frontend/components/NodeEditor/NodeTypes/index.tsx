"use client";
import { memo, useCallback, useState } from 'react';
import { Handle, Position, useNodeId, useReactFlow } from '@xyflow/react';
import type { PromptData, ImageUploadData, ImageNodeData } from '../types';
import Image from 'next/image';
import { CircularProgress } from '@mui/material'; // Ensure you have this or use a custom spinner

// Base Node Component
type BaseNodeProps = { label: string; icon: string; children?: React.ReactNode; isLoading?: boolean };
const BaseNode = ({ label, icon, children, isLoading }: BaseNodeProps) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const onCtx = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karate-node-contextmenu', { detail: { x: e.clientX, y: e.clientY, nodeId } }));
    }
  };
  const onMouseDownSelect = () => {
    if (!nodeId) return;
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, selected: true } : { ...n, selected: false })));
  };

  const isImageIcon = icon.startsWith('http') || icon.startsWith('/');

  return (
    <div
      className={`node-surface min-w-[260px] relative p-4 ${isLoading ? 'animate-pulse' : ''}`}
      style={{ outline: 'none' }}
      onContextMenu={onCtx}
      onMouseDown={onMouseDownSelect}
    >
      {/* Input Handle - Top */}
      <Handle 
        type="target" 
        position={Position.Top}
        isConnectable={true}
        id="target"
      />

      {/* Node Header */}
      <div className="node-header">
        <div className="flex items-center gap-2 w-full">
          <div className="text-xl flex items-center justify-center w-6 h-6">
            {isImageIcon ? (
              <img src={icon} alt="" className="w-full h-full object-contain" />
            ) : (
              icon
            )}
          </div>
          <h3 className="node-title flex-1">{label}</h3>
          {isLoading && <CircularProgress size={16} className="text-yellow-400" />}
        </div>
      </div>

      {/* Node Body */}
      <div className="node-body">{children}</div>

      {/* Output Handle - Bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom}
        isConnectable={true}
        id="source"
      />
    </div>
  );
};

// Stable Diffusion Node
export const StableDiffusionNode = memo(({ data }: { data: { label?: string; prompt?: string; status?: string; error?: string; output?: string; aspect_ratio?: string; guidance_scale?: number; output_format?: string; safety_tolerance?: number; seed?: number; logo?: string } }) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = useCallback((patch: Record<string, unknown>) => {
    if (!nodeId) return;
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [nodeId, setNodes]);

  const onRunNode = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karate-run-node', { detail: { nodeId } }));
    }
  };

  const isLoading = data.status === 'processing';
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BaseNode label={data.label || 'Stable Diffusion 3.5'} icon={data.logo || "✨"} isLoading={isLoading}>
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Prompt</div>
        <textarea 
          value={data.prompt || ''}
          onChange={(e) => updateData({ prompt: e.target.value })}
          className="node-textarea h-16" 
          placeholder="Describe your image..." 
          disabled={isLoading} 
        />
        
        {settingsOpen && (
          <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800 space-y-2 text-[10px]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-400 block mb-1">Aspect Ratio</label>
                <select 
                  className="node-input" 
                  value={data.aspect_ratio || '1:1'} 
                  onChange={(e) => updateData({ aspect_ratio: e.target.value })}
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="21:9">21:9 Ultrawide</option>
                  <option value="3:2">3:2 Classic</option>
                  <option value="2:3">2:3 Portrait</option>
                  <option value="4:5">4:5 Social</option>
                  <option value="5:4">5:4 Social</option>
                  <option value="9:16">9:16 Vertical</option>
                  <option value="9:21">9:21 Tall</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Format</label>
                <select 
                  className="node-input"
                  value={data.output_format || 'webp'}
                  onChange={(e) => updateData({ output_format: e.target.value })}
                >
                  <option value="webp">WEBP</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <div>
                <label className="text-zinc-400 block mb-1">Guidance</label>
                <input 
                  type="number" 
                  step={0.1} 
                  className="node-input" 
                  value={data.guidance_scale || 3.5}
                  onChange={(e) => updateData({ guidance_scale: Number(e.target.value) })}
                />
               </div>
               <div>
                <label className="text-zinc-400 block mb-1">Safety (1-5)</label>
                <input 
                  type="number" 
                  min={1} max={5} 
                  className="node-input" 
                  value={data.safety_tolerance || 2}
                  onChange={(e) => updateData({ safety_tolerance: Number(e.target.value) })}
                />
               </div>
            </div>

            <div>
                <label className="text-zinc-400 block mb-1">Seed (Optional)</label>
                <input 
                  type="number" 
                  className="node-input" 
                  placeholder="Random"
                  value={data.seed || ''}
                  onChange={(e) => updateData({ seed: e.target.value ? Number(e.target.value) : undefined })}
                />
            </div>
          </div>
        )}

        {data.error && (
            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-800">
                Error: {data.error}
            </div>
        )}

        {data.output && (
             <div className="relative w-full h-32 mt-2 rounded overflow-hidden border border-zinc-700 group">
                <Image src={data.output} alt="Generated" fill className="object-cover" unoptimized />
                <a href={data.output} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Open</a>
             </div>
        )}
        
        <div className="node-toolbar">
          <button 
            className={`node-btn flex-1 ${settingsOpen ? 'bg-zinc-700 text-white' : ''}`} 
            disabled={isLoading}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            ⚙️ Settings
          </button>
          <button className="node-btn flex-1" disabled={isLoading} onClick={onRunNode}>
            {isLoading ? 'Generating...' : '🎨 Generate'}
          </button>
        </div>
      </div>
    </BaseNode>
  );
});

StableDiffusionNode.displayName = 'StableDiffusionNode';

// Image Node
export const ImageNode = memo(({ data }: { data: ImageNodeData }) => {
  return (
    <BaseNode label={data.label || 'Image'} icon={data.logo || "🖼️"}>
      <div className="space-y-2">
        <div className="relative w-full h-24 bg-zinc-800/60 border border-zinc-700 rounded flex items-center justify-center overflow-hidden">
          {data.imageSrc ? (
            <Image
              src={data.imageSrc}
              alt={data.imageName || data.label || 'image'}
              fill
              className="object-contain"
            />
          ) : (
            <span className="text-3xl">🖼️</span>
          )}
        </div>
        <button className="node-btn w-full">
          📁 Upload Image
        </button>
      </div>
    </BaseNode>
  );
});

ImageNode.displayName = 'ImageNode';

// Text Node
export const TextNode = memo(({ data }: { data: { label?: string; text?: string } }) => {
  return (
    <BaseNode label={data.label || 'Text Input'} icon="📝">
      <div className="space-y-2">
        <input type="text" defaultValue={data.text || 'Enter text...'} className="node-input" placeholder="Enter text..." />
      </div>
    </BaseNode>
  );
});

TextNode.displayName = 'TextNode';

// Upscale Node
export const UpscaleNode = memo(({ data }: { data: { label?: string; scale?: string } }) => {
  const nodeId = useNodeId();
  const onRunNode = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karate-run-node', { detail: { nodeId } }));
    }
  };
  return (
    <BaseNode label={data.label || 'Upscale'} icon="🔍">
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Scale Factor</div>
        <select className="node-input">
          <option>2x (Double)</option>
          <option>4x (Quad)</option>
          <option>8x (Ultra)</option>
        </select>
        <button className="node-btn w-full" onClick={onRunNode}>
          ⚡ Upscale
        </button>
      </div>
    </BaseNode>
  );
});

UpscaleNode.displayName = 'UpscaleNode';

// Inpaint Node
export const InpaintNode = memo(({ data }: { data: { label?: string; prompt?: string } }) => {
  const nodeId = useNodeId();
  const onRunNode = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karate-run-node', { detail: { nodeId } }));
    }
  };
  return (
    <BaseNode label={data.label || 'Inpaint'} icon="🎨">
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Mask & Prompt</div>
        <textarea defaultValue={data.prompt || 'What to inpaint...'} className="node-textarea h-12" placeholder="Describe what to paint..." />
        <button className="node-btn w-full" onClick={onRunNode}>
          🎨 Inpaint
        </button>
      </div>
    </BaseNode>
  );
});

InpaintNode.displayName = 'InpaintNode';

// Prompt Node
export const PromptNode = memo(({ data }: { data: PromptData }) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = useCallback((patch: Record<string, unknown>) => {
    if (!nodeId) return;
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [nodeId, setNodes]);

  const steps = data.steps ?? 28;
  const guidance = data.guidance ?? 7.5;
  const seed = data.seed ?? '';

  return (
    <BaseNode
      label={data.label || 'Prompt'}
      icon="📝"
    >
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Prompt</div>
        <textarea
          value={data.prompt || ''}
          onChange={(e) => updateData({ prompt: e.target.value })}
          className="w-full text-xs p-2 bg-black/50 border border-yellow-500/30 rounded text-zinc-200 resize-none h-16 focus:outline-none focus:border-yellow-400"
          placeholder="Describe your image..."
        />

        <div className="text-xs text-zinc-300 font-medium">Negative Prompt</div>
        <textarea
          value={data.negativePrompt || ''}
          onChange={(e) => updateData({ negativePrompt: e.target.value })}
          className="w-full text-xs p-2 bg-black/50 border border-yellow-500/30 rounded text-zinc-200 resize-none h-12 focus:outline-none focus:border-yellow-400"
          placeholder="What to avoid..."
        />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Steps</div>
            <input type="number" value={steps} min={1} max={100} onChange={(e) => updateData({ steps: Number(e.target.value) })} className="node-input" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Guidance</div>
            <input type="number" value={guidance} step={0.5} min={0} max={50} onChange={(e) => updateData({ guidance: Number(e.target.value) })} className="node-input" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Seed</div>
            <input type="text" value={seed} onChange={(e) => updateData({ seed: e.target.value })} className="node-input" placeholder="random" />
          </div>
        </div>
      </div>
    </BaseNode>
  );
});

PromptNode.displayName = 'PromptNode';

// Image Upload Node
export const ImageUploadNode = memo(({ data }: { data: ImageUploadData }) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = useCallback((patch: Record<string, unknown>) => {
    if (!nodeId) return;
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [nodeId, setNodes]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateData({ imageSrc: reader.result as string, imageName: file.name });
    };
    reader.readAsDataURL(file);
  }, [updateData]);

  return (
    <BaseNode
      label={data.label || 'Image Upload'}
      icon="📤"
    >
      <div className="space-y-2">
        <div className="relative w-full h-24 bg-gradient-to-br from-cyan-600/20 to-cyan-500/20 border border-cyan-500/30 rounded flex items-center justify-center overflow-hidden">
          {data.imageSrc ? (
            <Image
              src={data.imageSrc}
              alt={data.imageName || 'uploaded'}
              fill
              className="object-contain"
            />
          ) : (
            <span className="text-3xl">🖼️</span>
          )}
        </div>
        <label className="block w-full">
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          <div className="w-full py-1.5 text-xs text-center bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded hover:bg-cyan-500/30 transition-all cursor-pointer">
            {data.imageName ? `Replace (${data.imageName})` : '📁 Upload Image'}
          </div>
        </label>
      </div>
    </BaseNode>
  );
});

ImageUploadNode.displayName = 'ImageUploadNode';
