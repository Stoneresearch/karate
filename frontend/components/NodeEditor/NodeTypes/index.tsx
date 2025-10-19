import { memo, useCallback, useMemo, useState } from 'react';
import { Handle, Position, useNodeId, useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';

// Base Node Component
const BaseNode = ({
  label,
  icon,
  color,
  children,
}: {
  label: string;
  icon: string;
  color: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={`bg-gradient-to-b ${color} border border-opacity-50 rounded-lg min-w-[220px] shadow-lg relative p-4`}
      style={{ outline: 'none' }}
    >
      {/* Input Handle - Top */}
      <Handle 
        type="target" 
        position={Position.Top}
        isConnectable={true}
        id="target"
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl">{icon}</div>
        <h3 className="text-sm font-bold text-white">{label}</h3>
      </div>

      {/* Node Body */}
      {children}

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
export const StableDiffusionNode = memo(({ data }: any) => {
  return (
    <BaseNode
      label={data.label || 'Stable Diffusion 3.5'}
      icon="✨"
      color="from-purple-900/80 to-purple-800/80"
    >
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Prompt</div>
        <textarea
          defaultValue={data.prompt || 'Create an AI-generated image...'}
          className="w-full text-xs p-2 bg-black/50 border border-purple-500/30 rounded text-zinc-200 resize-none h-16 focus:outline-none focus:border-yellow-400"
          placeholder="Describe your image..."
        />
        <div className="flex gap-1">
          <button className="flex-1 py-1 px-2 text-xs bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 rounded hover:bg-yellow-400/30 transition-all">
            ⚙️ Settings
          </button>
          <button className="flex-1 py-1 px-2 text-xs bg-purple-500/20 border border-purple-400/50 text-purple-300 rounded hover:bg-purple-500/30 transition-all">
            🎨 Generate
          </button>
        </div>
      </div>
    </BaseNode>
  );
});

StableDiffusionNode.displayName = 'StableDiffusionNode';

// Image Node
export const ImageNode = memo(({ data }: any) => {
  return (
    <BaseNode
      label={data.label || 'Image'}
      icon="🖼️"
      color="from-cyan-900/80 to-cyan-800/80"
    >
      <div className="space-y-2">
        <div className="w-full h-24 bg-gradient-to-br from-cyan-600/20 to-cyan-500/20 border border-cyan-500/30 rounded flex items-center justify-center">
          <span className="text-3xl">🖼️</span>
        </div>
        <button className="w-full py-1.5 text-xs bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded hover:bg-cyan-500/30 transition-all">
          📁 Upload Image
        </button>
      </div>
    </BaseNode>
  );
});

ImageNode.displayName = 'ImageNode';

// Text Node
export const TextNode = memo(({ data }: any) => {
  return (
    <BaseNode
      label={data.label || 'Text Input'}
      icon="📝"
      color="from-orange-900/80 to-orange-800/80"
    >
      <div className="space-y-2">
        <input
          type="text"
          defaultValue={data.text || 'Enter text...'}
          className="w-full text-xs p-2 bg-black/50 border border-orange-500/30 rounded text-zinc-200 focus:outline-none focus:border-yellow-400"
          placeholder="Enter text..."
        />
      </div>
    </BaseNode>
  );
});

TextNode.displayName = 'TextNode';

// Upscale Node
export const UpscaleNode = memo(({ data }: any) => {
  return (
    <BaseNode
      label={data.label || 'Upscale'}
      icon="🔍"
      color="from-blue-900/80 to-blue-800/80"
    >
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Scale Factor</div>
        <select className="w-full text-xs p-2 bg-black/50 border border-blue-500/30 rounded text-zinc-200 focus:outline-none focus:border-yellow-400">
          <option>2x (Double)</option>
          <option>4x (Quad)</option>
          <option>8x (Ultra)</option>
        </select>
        <button className="w-full py-1.5 text-xs bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded hover:bg-blue-500/30 transition-all">
          ⚡ Upscale
        </button>
      </div>
    </BaseNode>
  );
});

UpscaleNode.displayName = 'UpscaleNode';

// Inpaint Node
export const InpaintNode = memo(({ data }: any) => {
  return (
    <BaseNode
      label={data.label || 'Inpaint'}
      icon="🎨"
      color="from-pink-900/80 to-pink-800/80"
    >
      <div className="space-y-2">
        <div className="text-xs text-zinc-300 font-medium">Mask & Prompt</div>
        <textarea
          defaultValue={data.prompt || 'What to inpaint...'}
          className="w-full text-xs p-2 bg-black/50 border border-pink-500/30 rounded text-zinc-200 resize-none h-12 focus:outline-none focus:border-yellow-400"
          placeholder="Describe what to paint..."
        />
        <button className="w-full py-1.5 text-xs bg-pink-500/20 border border-pink-400/50 text-pink-300 rounded hover:bg-pink-500/30 transition-all">
          🎨 Inpaint
        </button>
      </div>
    </BaseNode>
  );
});

InpaintNode.displayName = 'InpaintNode';

// Prompt Node
export const PromptNode = memo(({ data }: any) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = useCallback((patch: Record<string, any>) => {
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
            <input
              type="number"
              value={steps}
              min={1}
              max={100}
              onChange={(e) => updateData({ steps: Number(e.target.value) })}
              className="w-full text-xs p-1.5 bg-black/50 border border-zinc-600 rounded text-zinc-200 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Guidance</div>
            <input
              type="number"
              value={guidance}
              step={0.5}
              min={0}
              max={50}
              onChange={(e) => updateData({ guidance: Number(e.target.value) })}
              className="w-full text-xs p-1.5 bg-black/50 border border-zinc-600 rounded text-zinc-200 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Seed</div>
            <input
              type="text"
              value={seed}
              onChange={(e) => updateData({ seed: e.target.value })}
              className="w-full text-xs p-1.5 bg-black/50 border border-zinc-600 rounded text-zinc-200 focus:outline-none focus:border-yellow-400"
              placeholder="random"
            />
          </div>
        </div>
      </div>
    </BaseNode>
  );
});

PromptNode.displayName = 'PromptNode';

// Image Upload Node
export const ImageUploadNode = memo(({ data }: any) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = useCallback((patch: Record<string, any>) => {
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
