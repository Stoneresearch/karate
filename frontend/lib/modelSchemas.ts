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

// Generated Schemas from Replicate API
export const MODEL_SCHEMAS: Record<string, ModelSchema> = {
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
          { "name": "guidance", "label": "Guidance", "type": "number", "description": "Controls the balance between adherence to the text prompt and image quality/diversity. Higher values make the output more strictly follow the prompt, while lower values allow for more creative freedom.", "default": 3.5, "min": 0, "max": 10 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "webp", "options": ["webp", "jpg", "png"] },
          { "name": "output_quality", "label": "Output Quality", "type": "number", "description": "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs", "default": 80, "min": 0, "max": 100 },
          { "name": "megapixels", "label": "Megapixels", "type": "select", "description": "Approximate number of megapixels for the generated image", "default": "1", "options": ["1", "0.25"] },
          { "name": "num_inference_steps", "label": "Num Inference Steps", "type": "number", "description": "Number of denoising steps. Recommended range is 28-50", "default": 28, "min": 1, "max": 50 },
          { "name": "go_fast", "label": "Go Fast", "type": "boolean", "description": "Run faster, but with slightly lower quality", "default": true },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" },
          { "name": "disable_safety_checker", "label": "Disable Safety Checker", "type": "boolean", "description": "Disable safety checker for generated images", "default": false }
      ]
  },
  'ideogram-ai/ideogram-v2': {
      "slug": "ideogram-ai/ideogram-v2",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic cityscape with towering skyscrapers and flying cars, illuminated by neon lights and a starry sky." },
          { "name": "resolution", "label": "Resolution", "type": "select", "description": "Resolution of the output image", "default": "None", "options": ["None", "1024x1024", "1280x720", "720x1280", "1408x704", "704x1408", "1536x640", "640x1536", "1664x576", "576x1664", "1728x576", "576x1728", "1792x448", "448x1792"] },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio of the output image. One of 'resolution' or 'aspect_ratio' must be provided.", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "style_type", "label": "Style Type", "type": "select", "description": "Style to apply to the generated image", "default": "REALISTIC", "options": ["AUTO", "GENERAL", "REALISTIC", "DESIGN", "RENDER_3D", "ANIME"] },
          { "name": "magic_prompt_option", "label": "Magic Prompt Option", "type": "select", "description": "Magic prompt option", "default": "AUTO", "options": ["AUTO", "ON", "OFF"] },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Negative prompt", "default": "" },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Seed for the random number generator" }
      ]
  },
  'tencent/hunyuan-video': {
      "slug": "tencent/hunyuan-video",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt to use for video generation", "default": "A cat walks on the grass, realistic style." },
          { "name": "video_length", "label": "Video Length", "type": "number", "description": "Length of the generated video in frames", "default": 85, "min": 1, "max": 129 },
          { "name": "fps", "label": "Fps", "type": "number", "description": "Frames per second of the generated video", "default": 24, "min": 1 },
          { "name": "resolution", "label": "Resolution", "type": "select", "description": "Resolution of the generated video", "default": "720p", "options": ["720p", "540p"] },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" },
          { "name": "flow_shift", "label": "Flow Shift", "type": "number", "description": "Flow shift parameter", "default": 7, "min": 0 },
          { "name": "embedded_guidance_scale", "label": "Embedded Guidance Scale", "type": "number", "description": "Embedded guidance scale", "default": 6, "min": 0 },
          { "name": "num_inference_steps", "label": "Num Inference Steps", "type": "number", "description": "Number of denoising steps", "default": 50, "min": 1 }
      ]
  },
  'wan-video/wan-2.1-t2v-14b': {
    slug: 'wan-video/wan-2.1-t2v-14b',
    parameters: [
        { name: 'prompt', label: 'Prompt', type: 'string', default: 'A cinematic drone shot of a coastal cliff...' },
        { name: 'negative_prompt', label: 'Negative Prompt', type: 'string', default: 'Blurry, low quality, distortion' },
        { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1'], default: '16:9' },
        { name: 'sample_shift', label: 'Sample Shift', type: 'number', min: 1, max: 20, default: 5, description: "Controls motion consistency" },
        { name: 'sample_guide_scale', label: 'Guide Scale', type: 'number', min: 1, max: 20, default: 5 },
        { name: 'frames', label: 'Frames', type: 'number', default: 81, min: 1, max: 129 },
        { name: 'seed', label: 'Seed', type: 'number', default: -1 }
    ]
  },
  'recraft-ai/recraft-v3-svg': {
      "slug": "recraft-ai/recraft-v3-svg",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "A simple vector icon of a rocket ship" },
          { "name": "style", "label": "Style", "type": "select", "description": "Style of the SVG", "default": "icon", "options": ["icon", "illustration", "logo"] },
          { "name": "color_mode", "label": "Color Mode", "type": "select", "description": "Color mode", "default": "color", "options": ["color", "monochrome"] },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed" }
      ]
  }
};

// Helper to get schema by UI label
export function getSchemaForModel(modelLabel: string, modelSlug?: string): ModelSchema {
    // Try exact slug match first
    if (modelSlug && MODEL_SCHEMAS[modelSlug]) return MODEL_SCHEMAS[modelSlug];

    // Fallback map based on label content
    if (modelLabel.includes('Flux Pro 1.1 Ultra')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro-ultra'];
    if (modelLabel.includes('Flux Pro 1.1')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro'];
    if (modelLabel.includes('Flux Dev')) return MODEL_SCHEMAS['black-forest-labs/flux-dev'];
    if (modelLabel.includes('Ideogram')) return MODEL_SCHEMAS['ideogram-ai/ideogram-v2'];
    if (modelLabel.includes('Hunyuan Video')) return MODEL_SCHEMAS['tencent/hunyuan-video'];
    if (modelLabel.includes('Wan')) return MODEL_SCHEMAS['wan-video/wan-2.1-t2v-14b'];
    if (modelLabel.includes('Recraft')) return MODEL_SCHEMAS['recraft-ai/recraft-v3-svg'];

    // Default generic schema for unknown models
    return {
        slug: 'generic',
        parameters: [
            { name: 'prompt', label: 'Prompt', type: 'string', default: '' },
            { name: 'negative_prompt', label: 'Negative Prompt', type: 'string', default: '' },
            { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3', '3:4'], default: '1:1' },
            { name: 'guidance_scale', label: 'Guidance', type: 'number', default: 7.5, step: 0.1 },
            { name: 'seed', label: 'Seed', type: 'number' }
        ]
    };
}
