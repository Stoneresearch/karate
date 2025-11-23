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
  'black-forest-labs/flux-canny-pro': {
      "slug": "black-forest-labs/flux-canny-pro",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "a tiny astronaut hatching from an egg on the moon" },
          { "name": "control_image", "label": "Control Image", "type": "string", "description": "Image to use for Canny edge detection (URL or Data URI)", "default": "" },
          { "name": "steps", "label": "Steps", "type": "number", "description": "Number of steps", "default": 50, "min": 1, "max": 50 },
          { "name": "guidance", "label": "Guidance", "type": "number", "description": "Guidance scale", "default": 30, "min": 1 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "jpg", "options": ["jpg", "png"] },
          { "name": "safety_tolerance", "label": "Safety Tolerance", "type": "number", "description": "Safety tolerance", "default": 2, "min": 1, "max": 5 }
      ]
  },
  'black-forest-labs/flux-depth-pro': {
      "slug": "black-forest-labs/flux-depth-pro",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "a tiny astronaut hatching from an egg on the moon" },
          { "name": "control_image", "label": "Control Image", "type": "string", "description": "Image to use for Depth detection (URL or Data URI)", "default": "" },
          { "name": "steps", "label": "Steps", "type": "number", "description": "Number of steps", "default": 50, "min": 1, "max": 50 },
          { "name": "guidance", "label": "Guidance", "type": "number", "description": "Guidance scale", "default": 20, "min": 1 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "jpg", "options": ["jpg", "png"] },
          { "name": "safety_tolerance", "label": "Safety Tolerance", "type": "number", "description": "Safety tolerance", "default": 2, "min": 1, "max": 5 }
      ]
  },

  // --- STABILITY AI ---
  'stability-ai/stable-diffusion-3.5-large': {
      "slug": "stability-ai/stable-diffusion-3.5-large",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A capybara wearing a suit holding a sign that reads 'Hello World'" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Input Negative Prompt", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "5:4", "4:5", "21:9", "9:21"] },
          { "name": "cfg", "label": "CFG Scale", "type": "number", "description": "Guidance scale for the diffusion process", "default": 4.5, "min": 0, "max": 10 },
          { "name": "steps", "label": "Steps", "type": "number", "description": "Number of diffusion steps", "default": 40, "min": 1, "max": 50 },
          { "name": "output_format", "label": "Output Format", "type": "select", "description": "Format of the output images", "default": "webp", "options": ["webp", "jpg", "png"] },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed. Set for reproducible generation" }
      ]
  },

  // --- IDEOGRAM ---
  'ideogram-ai/ideogram-v2': {
      "slug": "ideogram-ai/ideogram-v2",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic cityscape..." },
          { "name": "resolution", "label": "Resolution", "type": "select", "description": "Resolution of the output image", "default": "None", "options": ["None", "1024x1024", "1280x720", "720x1280", "1408x704", "704x1408", "1536x640", "640x1536"] },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio of the output image", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "style_type", "label": "Style Type", "type": "select", "description": "Style to apply", "default": "REALISTIC", "options": ["AUTO", "GENERAL", "REALISTIC", "DESIGN", "RENDER_3D", "ANIME"] },
          { "name": "magic_prompt_option", "label": "Magic Prompt", "type": "select", "description": "Magic prompt option", "default": "AUTO", "options": ["AUTO", "ON", "OFF"] },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Negative prompt", "default": "" },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Seed for the random number generator" }
      ]
  },

  // --- GOOGLE ---
  'google/imagen-3': {
      "slug": "google/imagen-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city with flying cars" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "description": "Aspect ratio for the generated image", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "safety_filter_level", "label": "Safety Filter", "type": "select", "description": "Safety filter level", "default": "block_some", "options": ["block_most", "block_some", "block_few"] },
          { "name": "person_generation", "label": "Person Generation", "type": "select", "description": "Allow person generation", "default": "allow_adult", "options": ["dont_allow", "allow_adult"] }
      ]
  },
  'google/imagen-3-fast': {
      "slug": "google/imagen-3-fast",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3"] },
          { "name": "safety_filter_level", "label": "Safety Filter", "type": "select", "default": "block_some", "options": ["block_most", "block_some", "block_few"] }
      ]
  },
  'google/veo': {
      "slug": "google/veo",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" },
          { "name": "resolution", "label": "Resolution", "type": "select", "default": "1080p", "options": ["1080p", "720p"] },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "16:9", "options": ["16:9", "9:16", "1:1"] }
      ]
  },
  'google/veo-3': {
      "slug": "google/veo-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "resolution", "label": "Resolution", "type": "select", "default": "4k", "options": ["4k", "1080p", "720p"] },
          { "name": "frames", "label": "Frames", "type": "number", "default": 120, "min": 24, "max": 240 }
      ]
  },
  'google/veo-3.1': {
      "slug": "google/veo-3.1",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "resolution", "label": "Resolution", "type": "select", "default": "4k", "options": ["4k", "1080p", "720p"] },
          { "name": "frames", "label": "Frames", "type": "number", "default": 120, "min": 24, "max": 240 },
          { "name": "audio", "label": "Generate Audio", "type": "boolean", "default": true }
      ]
  },
  'openai/sora-2': {
      "slug": "openai/sora-2",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "duration", "label": "Duration (s)", "type": "number", "default": 10, "min": 5, "max": 60 },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "16:9", "options": ["16:9", "9:16", "1:1"] }
      ]
  },
  'wan-video/wan-2.5': {
      "slug": "wan-video/wan-2.5",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "" },
          { "name": "frames", "label": "Frames", "type": "number", "default": 120, "min": 24, "max": 240 }
      ]
  },
  'google/gemini-2.5-flash-image': {
      "slug": "google/gemini-2.5-flash-image",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16"] }
      ]
  },
  'google/veo-2': {
      "slug": "google/veo-2",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cinematic video of..." },
          { "name": "resolution", "label": "Resolution", "type": "select", "default": "1080p", "options": ["1080p", "720p"] },
           { "name": "frames", "label": "Frames", "type": "number", "default": 60, "min": 24, "max": 120 }
      ]
  },
  'google/nano-banana': {
      "slug": "google/nano-banana",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A banana" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3"] }
      ]
  },
  'google/nano-banana-pro': {
      "slug": "google/nano-banana-pro",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Input prompt", "default": "A futuristic city" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"] },
          { "name": "guidance_scale", "label": "Guidance Scale", "type": "number", "default": 7.5, "min": 1, "max": 20 },
          { "name": "num_inference_steps", "label": "Steps", "type": "number", "default": 30, "min": 10, "max": 100 },
          { "name": "seed", "label": "Seed", "type": "number" }
      ]
  },

  // --- RECRAFT ---
  'recraft-ai/recraft-v3-svg': {
      "slug": "recraft-ai/recraft-v3-svg",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for generated image", "default": "A simple vector icon of a rocket ship" },
          { "name": "style", "label": "Style", "type": "select", "description": "Style of the SVG", "default": "icon", "options": ["icon", "illustration", "logo"] },
          { "name": "color_mode", "label": "Color Mode", "type": "select", "description": "Color mode", "default": "color", "options": ["color", "monochrome"] },
          { "name": "seed", "label": "Seed", "type": "number", "description": "Random seed" }
      ]
  },

  // --- OPENAI (via Replicate or direct) ---
  'openai/dall-e-3': {
      "slug": "openai/dall-e-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A cute cat" },
          { "name": "size", "label": "Size", "type": "select", "default": "1024x1024", "options": ["1024x1024", "1024x1792", "1792x1024"] },
          { "name": "quality", "label": "Quality", "type": "select", "default": "standard", "options": ["standard", "hd"] },
          { "name": "style", "label": "Style", "type": "select", "default": "vivid", "options": ["vivid", "natural"] }
      ]
  },
  
  // --- VIDEO MODELS ---
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
  'minimax/video-01': {
      "slug": "minimax/video-01",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for video generation", "default": "A cute cat playing with a ball of yarn" },
          { "name": "prompt_optimizer", "label": "Prompt Optimizer", "type": "boolean", "description": "Optimize the prompt for better results", "default": true }
      ]
  },
  'minimax/image-01': {
      "slug": "minimax/image-01",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A beautiful landscape" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "default": "1:1", "options": ["1:1", "16:9", "9:16", "4:3", "3:4"] }
      ]
  },
  'kwaivgi/kling-v1.6-pro': {
      "slug": "kwaivgi/kling-v1.6-pro",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for video generation", "default": "" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Negative prompt", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" },
          { "name": "duration", "label": "Duration", "type": "select", "options": ["5s", "10s"], "default": "5s" },
          { "name": "cfg_scale", "label": "CFG Scale", "type": "number", "default": 0.5, "min": 0, "max": 1, "step": 0.1 },
          { "name": "start_image", "label": "Start Image", "type": "string", "description": "First frame image", "default": "" },
          { "name": "end_image", "label": "End Image", "type": "string", "description": "Last frame image", "default": "" },
          { "name": "camera_control", "label": "Camera Control", "type": "string", "description": "Camera control (e.g. 'zoom_in', 'pan_right')", "default": "" }
      ]
  },
  'kwaivgi/kling-v2.1': {
      "slug": "kwaivgi/kling-v2.1",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for video generation", "default": "" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Negative prompt", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" },
          { "name": "duration", "label": "Duration", "type": "select", "options": ["5s", "10s"], "default": "5s" },
          { "name": "cfg_scale", "label": "CFG Scale", "type": "number", "default": 0.5, "min": 0, "max": 1, "step": 0.1 },
          { "name": "mode", "label": "Mode", "type": "select", "options": ["std", "pro"], "default": "std" },
          { "name": "camera_control", "label": "Camera Control", "type": "string", "description": "Camera control (e.g. 'zoom_in', 'pan_right')", "default": "" }
      ]
  },
  'kling-ai/kling-v1': {
      "slug": "kling-ai/kling-v1",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "description": "Prompt for video generation", "default": "" },
          { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "description": "Negative prompt", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" },
          { "name": "duration", "label": "Duration", "type": "select", "options": ["5s", "10s"], "default": "5s" }
      ]
  },
  
  // --- RUNWAY ---
  'runwayml/runway-gen-3': {
      "slug": "runwayml/runway-gen-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "Cinematic shot of..." },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" },
          { "name": "duration", "label": "Duration (s)", "type": "number", "default": 5, "min": 5, "max": 10 }
      ]
  },
  'runway-generic': {
      "slug": "runway-generic",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" },
          { "name": "seconds", "label": "Duration (s)", "type": "number", "default": 4, "min": 4, "max": 10 }
      ]
  },
  
  // --- LUMA ---
  'luma/ray': {
      "slug": "luma/ray",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "Cinematic video..." },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" }
      ]
  },
  'luma-generic': {
      "slug": "luma-generic",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "" },
          { "name": "aspect_ratio", "label": "Aspect Ratio", "type": "select", "options": ["16:9", "9:16", "1:1"], "default": "16:9" }
      ]
  },
  
  // --- 3D ---
  'rodin/rodin-v1': {
      "slug": "rodin/rodin-v1",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A 3D model of..." },
          { "name": "image_path", "label": "Image Input", "type": "string", "description": "Optional input image", "default": "" }
      ]
  },
  'tencent/hunyuan-3d-1': {
      "slug": "tencent/hunyuan-3d-1",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A 3D model of a chair" },
          { "name": "image", "label": "Image", "type": "string", "description": "Single view image", "default": "" }
      ]
  },
  'meshy/meshy-3': {
      "slug": "meshy/meshy-3",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A high quality 3D model of..." },
          { "name": "image", "label": "Image", "type": "string", "description": "Image to 3D", "default": "" },
           { "name": "negative_prompt", "label": "Negative Prompt", "type": "string", "default": "" }
      ]
  },
  'microsoft/trellis': {
      "slug": "microsoft/trellis",
      "parameters": [
          { "name": "image", "label": "Image", "type": "string", "description": "Input image for 3D reconstruction", "default": "" }
      ]
  },

  // --- AUDIO ---
  'meta/musicgen': {
      "slug": "meta/musicgen",
      "parameters": [
          { "name": "prompt", "label": "Prompt", "type": "string", "default": "A pop song..." },
          { "name": "duration", "label": "Duration (s)", "type": "number", "default": 8, "min": 1, "max": 30 }
      ]
  }
};

// Helper to get schema by UI label
export function getSchemaForModel(modelLabel: string, modelSlug?: string): ModelSchema {
    // Try exact slug match first
    if (modelSlug && MODEL_SCHEMAS[modelSlug]) return MODEL_SCHEMAS[modelSlug];

    // Map specific labels to known slugs
    if (modelLabel.includes('Flux Pro 1.1 Ultra')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro-ultra'];
    if (modelLabel.includes('Flux Pro 1.1')) return MODEL_SCHEMAS['black-forest-labs/flux-1.1-pro'];
    if (modelLabel.includes('Flux Dev')) return MODEL_SCHEMAS['black-forest-labs/flux-dev'];
    if (modelLabel.includes('Flux Canny')) return MODEL_SCHEMAS['black-forest-labs/flux-canny-pro'];
    if (modelLabel.includes('Flux Depth')) return MODEL_SCHEMAS['black-forest-labs/flux-depth-pro'];
    
    if (modelLabel.includes('DALL·E 3')) return MODEL_SCHEMAS['openai/dall-e-3'];
    if (modelLabel.includes('GPT Image')) return MODEL_SCHEMAS['openai/dall-e-3']; // Fallback
    
    if (modelLabel.includes('Stable Diffusion 3.5')) return MODEL_SCHEMAS['stability-ai/stable-diffusion-3.5-large'];
    if (modelLabel.includes('Stable Diffusion 3')) return MODEL_SCHEMAS['stability-ai/stable-diffusion-3'];
    
    if (modelLabel.includes('Ideogram V2')) return MODEL_SCHEMAS['ideogram-ai/ideogram-v2'];
    if (modelLabel.includes('Ideogram')) return MODEL_SCHEMAS['ideogram-ai/ideogram-v2']; // Default to V2
    
    if (modelLabel.includes('Imagen 3 Fast')) return MODEL_SCHEMAS['google/imagen-3-fast'];
    if (modelLabel.includes('Imagen 3')) return MODEL_SCHEMAS['google/imagen-3'];
    if (modelLabel.includes('Sora 2')) return MODEL_SCHEMAS['openai/sora-2'];
    if (modelLabel.includes('Veo 3.1')) return MODEL_SCHEMAS['google/veo-3.1'];
    if (modelLabel.includes('Veo 3')) return MODEL_SCHEMAS['google/veo-3'];
    if (modelLabel.includes('Wan 2.5')) return MODEL_SCHEMAS['wan-video/wan-2.5'];
    if (modelLabel.includes('Gemini 2.5')) return MODEL_SCHEMAS['google/gemini-2.5-flash-image'];
    
    if (modelLabel.includes('Veo 2')) return MODEL_SCHEMAS['google/veo-2'];
    if (modelLabel.includes('Veo')) return MODEL_SCHEMAS['google/veo'];
    
    if (modelLabel.includes('Nano Banana Pro')) return MODEL_SCHEMAS['google/nano-banana-pro'];
    if (modelLabel.includes('Nano Banana')) return MODEL_SCHEMAS['google/nano-banana'];
    
    if (modelLabel.includes('Hunyuan Video')) return MODEL_SCHEMAS['tencent/hunyuan-video'];
    if (modelLabel.includes('Hunyuan 3D')) return MODEL_SCHEMAS['tencent/hunyuan-3d-1'];
    
    if (modelLabel.includes('Wan')) return MODEL_SCHEMAS['wan-video/wan-2.1-t2v-14b'];
    
    if (modelLabel.includes('Recraft')) return MODEL_SCHEMAS['recraft-ai/recraft-v3-svg'];
    
    if (modelLabel.includes('Minimax Image')) return MODEL_SCHEMAS['minimax/image-01'];
    if (modelLabel.includes('Minimax')) return MODEL_SCHEMAS['minimax/video-01'];
    
    if (modelLabel.includes('Kling v1.6')) return MODEL_SCHEMAS['kwaivgi/kling-v1.6-pro'];
    if (modelLabel.includes('Kling AI Video')) return MODEL_SCHEMAS['kwaivgi/kling-v1.6-pro'];
    if (modelLabel.includes('Kling')) return MODEL_SCHEMAS['kwaivgi/kling-v1.6-pro']; // Default to v1.6
    
    if (modelLabel.includes('Runway Gen-3')) return MODEL_SCHEMAS['runwayml/runway-gen-3'];
    if (modelLabel.includes('Runway')) return MODEL_SCHEMAS['runway-generic'];
    
    if (modelLabel.includes('Luma')) return MODEL_SCHEMAS['luma/ray'];
    
    if (modelLabel.includes('Rodin')) return MODEL_SCHEMAS['rodin/rodin-v1'];
    if (modelLabel.includes('Trellis')) return MODEL_SCHEMAS['microsoft/trellis'];
    if (modelLabel.includes('Meshy')) return MODEL_SCHEMAS['meshy/meshy-3'];
    
    if (modelLabel.includes('Lyria') || modelLabel.includes('Music')) return MODEL_SCHEMAS['meta/musicgen'];

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
