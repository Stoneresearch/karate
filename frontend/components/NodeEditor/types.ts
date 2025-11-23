// Shared frontend types for Node Editor

export type PaletteItem = {
  name: string;
  type: 'stableDiffusion' | 'image' | 'text' | 'upscale' | 'inpaint' | 'prompt' | 'imageUpload' | string;
  icon: string;
  category: string;
  brand: string;
  logo?: string;
  symbol?: string;
};

export type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  type: 'pane' | 'node';
  nodeId?: string;
} | null;

// Node data types
export type StableDiffusionData = { label?: string; prompt?: string; logo?: string };
export type ImageNodeData = { label?: string; imageSrc?: string; imageName?: string; logo?: string };
export type TextNodeData = { label?: string; text?: string; logo?: string };
export type UpscaleData = { label?: string; scale?: '2x' | '4x' | '8x'; logo?: string };
export type InpaintData = { label?: string; prompt?: string; logo?: string };
export type PromptData = {
  label?: string;
  prompt?: string;
  negativePrompt?: string;
  steps?: number;
  guidance?: number;
  seed?: string;
  logo?: string;
};
export type ImageUploadData = { label?: string; imageSrc?: string; imageName?: string; logo?: string };


