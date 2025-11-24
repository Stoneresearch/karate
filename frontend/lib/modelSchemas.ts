import { PaletteItem } from '../components/NodeEditor/types';

// Define the schema for dynamic parameters
export interface ModelParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // for select
  description?: string;
}

export interface ModelSchema {
  slug: string;
  parameters: ModelParameter[];
}

// Generated Schemas from Replicate API & Verified Slugs
export const MODEL_SCHEMAS: Record<string, ModelSchema> = {
  // --- FLUX FAMILY ---
  'black-forest-labs/flux-1.1-pro': {
    "slug": "black-forest-labs/flux-1.1-pro",
    "parameters": [
        { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "a tiny astronaut hatching from an egg on the moon" },
        { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "21:9", "3:2", "2:3", "4:5", "5:4", "9:16", "9:21"] },
        { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "webp", "options": ["webp", "jpg", "png"] },
        { "name": "output_quality", "label": "Output Quality", "type": "number", "description": "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs", "default": 80, "min": 0, "max": 100 },
        { "name": "safety_tolerance", "label": "Safety Tolerance", "type": "number", "description": "Safety tolerance, 1 is most strict and 5 is most permissive", "default": 2, "min": 1, "max": 5 },
        { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" }
    ]
  },
  'black-forest-labs/flux-1.1-pro-ultra': {
      "slug": "black-forest-labs/flux-1.1-pro-ultra",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "a tiny astronaut hatching from an egg on the moon" },
          { "name": "raw", "label": "Raw", "type": "boolean", "description": "Generate less processed, more natural-looking images", "default": false },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "9:21"] },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "jpg", "options": ["jpg", "png"] },
          { "name": "safety_tolerance", "label": "Safety Tolerance", "type": "number", "description": "Safety tolerance, 1 is most strict and 5 is most permissive", "default": 2, "min": 1, "max": 5 },
          { "name": "image_prompt_strength", "label": "Image Prompt Strength", "type": "number", "description": "Strength of the image prompt", "default": 0.1, "min": 0, "max": 1 },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" }
      ]
  },
  'black-forest-labs/flux-dev': {
      "slug": "black-forest-labs/flux-dev",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "a tiny astronaut hatching from an egg on the moon" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "21:9", "3:2", "2:3", "4:5", "5:4", "9:16", "9:21"] },
          { "name": "guidance", "label": "Guidance", "type": "number", "description": "Controls the balance between adherence to the text prompt and image quality/diversity.", "default": 3.5, "min": 0, "max": 10 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "webp", "options": ["webp", "jpg", "png"] },
          { "name": "output_quality", "label": "Output Quality", "type": "number", "description": "Quality when saving the output images, from 0 to 100.", "default": 80, "min": 0, "max": 100 },
          { "name": "megapixels", "label": "Megapixels", "type": "select", "description": "Approximate number of megapixels for the generated image", "default": "1", "options": ["1", "0.25"] },
          { "name": "num_inference_steps", "label": "Num Inference Steps", "type": "number", "description": "Number of denoising steps. Recommended range is 28-50", "default": 28, "min": 1, "max": 50 },
          { "name": "go_fast", "label": "Go Fast", "type": "boolean", "description": "Run faster, but with slightly lower quality", "default": true },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" },
          { "name": "disable_safety_checker", "label": "Disable Safety Checker", "type": "boolean", "description": "Disable safety checker for generated images", "default": false }
      ]
  },
  
  // --- STABILITY & SDXL ---
  'stability-ai/stable-diffusion-3.5-large': {
      "slug": "stability-ai/stable-diffusion-3.5-large",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A capybara wearing a suit" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Input Negative Prompt", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "5:4", "4:5", "21:9", "9:21"] },
          { "name": "cfg", "label": "CFG Scale", "type": "number", "description": "Guidance scale for the diffusion process", "default": 4.5, "min": 0, "max": 10 },
          { "name": "steps", "label": "Steps", "type": "number", "description": "Number of diffusion steps", "default": 40, "min": 1, "max": 50 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "webp", "options": ["webp", "jpg", "png"] },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" }
      ]
  },
  
  // --- GOOGLE ---
  'google/imagen-3': {
      "slug": "google/imagen-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city with flying cars" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "safety_filter_level", "label": "Safety Filter", "type": "select", "description": "Safety filter level", "default": "block_some", "options": ["block_most", "block_some", "block_few"] }
      ]
  },
  'google/imagen-4': {
      "slug": "google/imagen-4",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3"] },
          { "name": "safety_filter_level", "label": "Safety Filter", "type": "select", "default": "block_some", "options": ["block_most", "block_some", "block_few"] }
      ]
  },
  'google/imagen-4-fast': {
      "slug": "google/imagen-4-fast",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3"] }
      ]
  },
  'google/nano-banana': {
      "slug": "google/nano-banana",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A banana" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] }
      ]
  },
  'google/nano-banana-pro': {
      "slug": "google/nano-banana-pro",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A banana" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "guidance_scale", "label": "Guidance Scale", "type": "number", "default": 7.5, "min": 1, "max": 20 }
      ]
  },
  'google/veo-3-fast': {
      "slug": "google/veo-3-fast",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "resolution", "label": "Resolution", "type": "select", "default": "720p", "options": ["1080p", "720p"] },
          { "name": "frames", "label": "Frames", "type": "number", "default": 60, "min": 24, "max": 120 }
      ]
  },
  'openai/gpt-5-nano': {
      "slug": "openai/gpt-5-nano",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "Describe an image..." }
      ]
  },
  
  // --- OTHER MODELS ---
  'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241bbb49991ea7781': {
      "slug": "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241bbb49991ea7781",
      "parameters": [
          { "name": "image", "label": "Input Image", "type": "string", "default": "" },
          { "name": "scale", "label": "Scale", "type": "number", "default": 2, "min": 2, "max": 10 },
          { "name": "face_enhance", "label": "Face Enhance", "type": "boolean", "default": true }
      ]
  }
};

// Helper to get schema by UI label
export function getSchemaForModel(modelLabel: string, modelSlug?: string): ModelSchema {
    // Try exact slug match first
    if (modelSlug && MODEL_SCHEMAS[modelSlug]) return MODEL_SCHEMAS[modelSlug];

    // Map specific labels to known slugs
    if (modelLabel.includes('Nano Banana Pro')) return MODEL_SCHEMAS['google/nano-banana-pro'];
    if (modelLabel.includes('Nano Banana')) return MODEL_SCHEMAS['google/nano-banana'];
    if (modelLabel.includes('Imagen 4 Fast')) return MODEL_SCHEMAS['google/imagen-4-fast'];
    if (modelLabel.includes('Imagen 4')) return MODEL_SCHEMAS['google/imagen-4'];
    if (modelLabel.includes('Veo 3 Fast')) return MODEL_SCHEMAS['google/veo-3-fast'];
    if (modelLabel.includes('GPT-5 Nano')) return MODEL_SCHEMAS['openai/gpt-5-nano'];

    if (modelLabel.includes('Flux Pro 1.1 Ultra')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro-ultra'];
    if (modelLabel.includes('Flux Pro 1.1')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro'];
    if (modelLabel.includes('Flux Dev')) return MODEL_SCHEMAS['black-forest-labs/flux-dev'];
    
    if (modelLabel.includes('DALL·E 3')) return MODEL_SCHEMAS['openai/dall-e-3'];
    if (modelLabel.includes('Stable Diffusion 3.5')) return MODEL_SCHEMAS['stability-ai/stable-diffusion-3.5-large'];
    if (modelLabel.includes('Real-ESRGAN')) return MODEL_SCHEMAS['nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab241bbb49991ea7781'];

    // Default generic schema for unknown models
    return {
        slug: 'generic',
        parameters: [
            { name: 'prompt', label: 'Prompt', "type": "string", default: '' },
            { name: 'negative_prompt', label: 'Negative Prompt', "type": "string", default: '' },
            { name: 'aspect_ratio', label: 'Aspect Ratio', "type": "select", options: ['1:1', '16:9', '9:16', '4:3', '3:4'], default: '1:1' },
            { name: 'guidance_scale', label: 'Guidance', "type": "number", default: 7.5, step: 0.1 },
            { name: 'seed', label: 'Seed', "type": "number" }
        ]
    };
}
