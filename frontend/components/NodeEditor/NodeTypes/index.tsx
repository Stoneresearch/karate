"use client";
import { memo, useCallback } from 'react';
import { Handle, Position, useNodeId, useReactFlow } from '@xyflow/react';
import type { PromptData, ImageUploadData, ImageNodeData } from '../types';
import { motion } from 'framer-motion';

// Base Node Component
type BaseNodeProps = { label: string; icon: string; color: string; children?: React.ReactNode };
const BaseNode = ({ label, icon, color, children }: BaseNodeProps) => {
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
  return (
    <div
      className={`node-surface min-w-[260px] relative p-4`}
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
        <div className="flex items-center gap-2">
          <div className="text-xl">{icon}</div>
          <h3 className="node-title">{label}</h3>
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
export const StableDiffusionNode = memo(({ data }: { data: { label?: string; prompt?: string } }) => {
  return (
    <BaseNode label={data.label || 'Stable Diffusion 3.5'} icon="✨" color="accent-purple">
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Prompt</div>
        <textarea defaultValue={data.prompt || 'Create an AI-generated image...'} className="node-textarea h-16" placeholder="Describe your image..." />
        <div className="node-toolbar">
          <button className="node-btn node-btn-primary flex-1">
            ⚙️ Settings
          </button>
          <button className="node-btn flex-1">
            🎨 Generate
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
    <BaseNode label={data.label || 'Image'} icon="🖼️" color="accent-cyan">
      <div className="space-y-2">
        <div className="w-full h-24 bg-zinc-800/60 border border-zinc-700 rounded flex items-center justify-center overflow-hidden">
          {data.imageSrc ? (
            <img src={data.imageSrc} alt={data.imageName || data.label || 'image'} className="max-h-24 object-contain" />
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
    <BaseNode label={data.label || 'Text Input'} icon="📝" color="accent-orange">
      <div className="space-y-2">
        <input type="text" defaultValue={data.text || 'Enter text...'} className="node-input" placeholder="Enter text..." />
      </div>
    </BaseNode>
  );
});

TextNode.displayName = 'TextNode';

// Upscale Node
export const UpscaleNode = memo(({ data }: { data: { label?: string; scale?: string } }) => {
  return (
    <BaseNode label={data.label || 'Upscale'} icon="🔍" color="accent-blue">
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Scale Factor</div>
        <select className="node-input">
          <option>2x (Double)</option>
          <option>4x (Quad)</option>
          <option>8x (Ultra)</option>
        </select>
        <button className="node-btn w-full">
          ⚡ Upscale
        </button>
      </div>
    </BaseNode>
  );
});

UpscaleNode.displayName = 'UpscaleNode';

// Inpaint Node
export const InpaintNode = memo(({ data }: { data: { label?: string; prompt?: string } }) => {
  return (
    <BaseNode label={data.label || 'Inpaint'} icon="🎨" color="accent-pink">
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Mask & Prompt</div>
        <textarea defaultValue={data.prompt || 'What to inpaint...'} className="node-textarea h-12" placeholder="Describe what to paint..." />
        <button className="node-btn w-full">
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
      color="from-yellow-900/80 to-yellow-800/80"
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
      color="from-cyan-900/80 to-cyan-800/80"
    >
      <div className="space-y-2">
        <div className="w-full h-24 bg-gradient-to-br from-cyan-600/20 to-cyan-500/20 border border-cyan-500/30 rounded flex items-center justify-center overflow-hidden">
          {data.imageSrc ? (
            <img src={data.imageSrc} alt={data.imageName || 'uploaded'} className="max-h-24 object-contain" />
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
