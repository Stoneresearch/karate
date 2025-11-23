import React, { memo, ReactNode, useState, useCallback, useMemo } from 'react';
import { Handle, Position, useNodeId, useReactFlow } from '@xyflow/react';
import Image from 'next/image';
import { getSchemaForModel, ModelSchema } from '../../../lib/modelSchemas';
import type { PromptData, ImageUploadData, ImageNodeData } from '../types';

// Base Node Component with restored styling
const BaseNode = ({ children, label, icon, selected, isLoading }: { children: ReactNode; label: string; icon: string; selected?: boolean; isLoading?: boolean }) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  
  const onCtx = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('karate-node-contextmenu', { detail: { x: e.clientX, y: e.clientY, nodeId } }));
    }
  };

  return (
    <div 
        className={`node-surface min-w-[260px] relative p-4 ${isLoading ? 'animate-pulse' : ''} ${selected ? 'ring-1 ring-yellow-400/50 shadow-[0_0_30px_-5px_rgba(250,204,21,0.1)]' : ''}`}
        style={{ outline: 'none' }}
        onContextMenu={onCtx}
    >
       {/* Input Handle - Top */}
      <Handle type="target" position={Position.Top} id="target" className="node-handle !bg-zinc-600" />

       {/* Header */}
      <div className="node-header">
        <div className="flex items-center gap-2 w-full">
           <div className="text-xl flex items-center justify-center w-6 h-6">
             {isLoading ? (
               <div className="relative w-5 h-5">
                 <div className="absolute inset-0 rounded-full border-[2px] border-zinc-200 dark:border-zinc-700 opacity-20"></div>
                 <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-yellow-400 animate-spin"></div>
               </div>
             ) : (
               icon.startsWith('http') ? <img src={icon} className="w-full h-full object-contain" alt="" /> : icon
             )}
           </div>
           <h3 className="node-title flex-1">{label}</h3>
        </div>
        {/* Status Indicator */}
        {isLoading && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            </div>
        )}
      </div>

      {/* Body */}
      <div className="node-body">
        {children}
      </div>

      {/* Output Handle - Bottom */}
      <Handle type="source" position={Position.Bottom} id="source" className="node-handle !bg-yellow-400" />
    </div>
  );
};

// Generic Generative AI Node with Dynamic Schema Support
export const StableDiffusionNode = memo(({ data }: { data: { label?: string; prompt?: string; status?: string; error?: string; output?: string; logo?: string; [key: string]: any } }) => {
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
  
  // Get schema based on the node's label (model name)
  const schema = useMemo(() => getSchemaForModel(data.label || 'Stable Diffusion 3.5'), [data.label]);

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If it's a large file (likely for processing), we might want to handle it differently
    // For now, convert to DataURL
    const reader = new FileReader();
    reader.onload = () => {
        updateData({ [e.target.name]: reader.result as string });
    };
    reader.readAsDataURL(file);
  }, [updateData]);

  return (
    <BaseNode label={data.label || 'Generative Model'} icon={data.logo || "✨"} isLoading={isLoading}>
      <div className="space-y-2">
        {/* Always show Prompt as it's standard */}
        <div className="text-xs text-zinc-300 font-medium">Prompt</div>
        <textarea 
          value={data.prompt || ''}
          onChange={(e) => updateData({ prompt: e.target.value })}
          className="node-textarea nodrag h-20" 
          placeholder="Describe your creation..." 
          disabled={isLoading} 
        />
        
        {settingsOpen && (
          <div className="p-2 rounded border space-y-2 text-[10px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
             {schema.parameters.filter(p => p.name !== 'prompt').map((param) => (
                 <div key={param.name}>
                     <label className="text-zinc-600 dark:text-zinc-400 block mb-1 capitalize font-medium">{param.label || param.name}</label>
                     
                     {/* STRING INPUT - Check if it expects a URI/Image */}
                     {param.type === 'string' && (param.description?.toLowerCase().includes('uri') || param.description?.toLowerCase().includes('image') || param.description?.toLowerCase().includes('file')) ? (
                        <div className="space-y-1">
                            {data[param.name] && (
                                <div className="relative w-full h-16 bg-zinc-800 rounded overflow-hidden">
                                    <img src={data[param.name]} className="w-full h-full object-contain" alt="Uploaded" />
                                    <button 
                                        onClick={() => updateData({ [param.name]: undefined })}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <label className="block w-full cursor-pointer">
                                <input 
                                    type="file" 
                                    name={param.name}
                                    onChange={onFileChange} 
                                    className="hidden" 
                                    accept="image/*" // Basic default, could be dynamic
                                />
                                <div className="w-full py-1 text-center border border-dashed border-zinc-500 rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    {data[param.name] ? 'Change File' : 'Upload File'}
                                </div>
                            </label>
                        </div>
                     ) : param.type === 'select' ? (
                         <select 
                            className="node-input nodrag"
                            value={data[param.name] !== undefined ? data[param.name] : param.default}
                            onChange={(e) => updateData({ [param.name]: e.target.value })}
                         >
                             {param.options?.map(opt => (
                                 <option key={opt} value={opt}>{opt}</option>
                             ))}
                         </select>
                     ) : param.type === 'number' ? (
                         <input 
                            type="number"
                            className="node-input nodrag"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={data[param.name] !== undefined ? data[param.name] : (param.default ?? '')}
                            placeholder={param.default?.toString()}
                            onChange={(e) => updateData({ [param.name]: e.target.value === '' ? undefined : Number(e.target.value) })}
                         />
                     ) : param.type === 'boolean' ? (
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={!!(data[param.name] !== undefined ? data[param.name] : param.default)}
                                onChange={(e) => updateData({ [param.name]: e.target.checked })}
                            />
                            <span className="text-zinc-500">{param.description}</span>
                        </div>
                     ) : (
                         <textarea
                            className="node-textarea nodrag h-10"
                            value={data[param.name] !== undefined ? data[param.name] : (param.default ?? '')}
                            placeholder={param.description || ''}
                            onChange={(e) => updateData({ [param.name]: e.target.value })}
                         />
                     )}
                 </div>
             ))}
          </div>
        )}

        {data.error && (
            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-800">
                Error: {data.error}
            </div>
        )}

        {data.output && (
             <div className="relative w-full h-32 mt-2 rounded overflow-hidden border border-zinc-700 group">
                {data.output.endsWith('.mp4') || data.output.includes('video') ? (
                    <video src={data.output} controls className="w-full h-full object-cover" />
                ) : (
                    <Image src={data.output} alt="Generated" fill className="object-cover" unoptimized />
                )}
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
            {isLoading ? 'Generating...' : 'Generate'}
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
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const updateData = (text: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, text } } : n));
  };
  return (
    <BaseNode label={data.label || 'Text Input'} icon="📝">
      <div className="space-y-2">
        <textarea 
            defaultValue={data.text || ''} 
            onChange={(e) => updateData(e.target.value)}
            className="node-input nodrag h-24" 
            placeholder="Enter text..." 
        />
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
        <select className="node-input nodrag">
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
        <textarea defaultValue={data.prompt || 'What to inpaint...'} className="node-textarea nodrag h-12" placeholder="Describe what to paint..." />
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
          className="w-full text-xs p-2 bg-black/50 border border-yellow-500/30 rounded text-zinc-200 resize-none h-16 focus:outline-none focus:border-yellow-400 nodrag"
          placeholder="Describe your image..."
        />

        <div className="text-xs text-zinc-300 font-medium">Negative Prompt</div>
        <textarea
          value={data.negativePrompt || ''}
          onChange={(e) => updateData({ negativePrompt: e.target.value })}
          className="w-full text-xs p-2 bg-black/50 border border-yellow-500/30 rounded text-zinc-200 resize-none h-12 focus:outline-none focus:border-yellow-400 nodrag"
          placeholder="What to avoid..."
        />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Steps</div>
            <input type="number" value={steps} min={1} max={100} onChange={(e) => updateData({ steps: Number(e.target.value) })} className="node-input nodrag" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Guidance</div>
            <input type="number" value={guidance} step={0.5} min={0} max={50} onChange={(e) => updateData({ guidance: Number(e.target.value) })} className="node-input nodrag" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 mb-1">Seed</div>
            <input type="text" value={seed} onChange={(e) => updateData({ seed: e.target.value })} className="node-input nodrag" placeholder="random" />
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
