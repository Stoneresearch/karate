# Editor Guide

This guide explains how to build workflows that create AI-generated images, videos, and edits using the node-based editor.

## Core Concepts
- Node: A block that performs a function (Prompt, Image Upload, Upscale, Inpaint, Model nodes)
- Handles: Small circular connectors on each node
  - Output handle: bottom side (sends data forward)
  - Input handle: top side (receives data)
- Edge: A line connecting an output to an input

## Essential Actions
1) Add a node: open the sidebar and click a node to place it (or use the AI input bar)
2) Move a node: drag it on the canvas
3) Connect nodes: drag from output (bottom, yellow) to input (top, cyan)
4) Edit settings: click a node and fill in fields (text, prompt, selection). Right‑click anywhere on a node to open actions: Duplicate, Delete, Settings.
5) Save: changes save automatically
6) Sign In (optional):
- If Clerk is enabled, sign in to sync workflows between devices.
- Some features (e.g., team collaboration or billing) require sign-in.

## Recommended Starter Nodes
- Prompt: Type your idea; add negative prompt, steps, guidance, seed
- Image Upload: Choose an image from your device
- Stable Diffusion (or similar): Generates images from prompts
- Upscale: Improves resolution
- Inpaint: Edits specific regions according to a prompt

## Example Workflows

### A. Text-to-Image (Basic)
1. Add Prompt → describe your image
2. Add Stable Diffusion (or similar image model)
3. Connect Prompt (output) → Model (input)
4. Click Generate in the model node

What you get: a generated image from your text description.

### B. Text-to-Image with Enhancement
1. Add Prompt → write your description
2. Add Image Model → connect Prompt → Model
3. Add Upscale → connect Model (output image) → Upscale (input)
4. Set Upscale factor (2x or 4x) and run

What you get: a generated image, then an enhanced higher-resolution version.

### C. Image Upload to Upscale
1. Add Image Upload → pick a local image
2. Add Upscale
3. Connect Image Upload (output) → Upscale (input)
4. Choose 2x, 4x, or 8x and run

What you get: a higher-resolution version of your original image.

### D. Image Upload to Inpaint
1. Add Image Upload → pick an image
2. Add Inpaint
3. Connect Image Upload (output) → Inpaint (input)
4. Add a prompt describing what to change (e.g., "remove object" or "add detail")
5. Run

What you get: a modified image according to your inpainting prompt.

### E. Prompt → Image → Inpaint
1. Add Prompt → describe base scene
2. Add Image Model → connect Prompt → Model and generate
3. Add Inpaint → connect Model (output) → Inpaint (input)
4. In Inpaint, write a targeted edit prompt and run

What you get: generate a base image, then apply a targeted edit.

### F. Prompt → Image → Upscale → Inpaint
1. Add Prompt → Image Model (connect and generate)
2. Add Upscale → connect Model → Upscale; run upscale
3. Add Inpaint → connect Upscale (output) → Inpaint (input); edit prompt and run

What you get: high-quality base image with an additional refined edit.

### G. Batch Concept (Manual)
- Create multiple branches from the same Prompt
- Connect each branch to a different model or different settings
- Review outputs and keep the best results

## Best Practices
- Start simple: one prompt → one model → one post-process node
- Iterate: change prompt or parameters and generate again
- Use negative prompts to avoid unwanted elements
- Save often (auto-save is enabled, but revisit Dashboard to ensure your project appears in "My Files")

## Accounts & Permissions (If Auth Enabled)
- Users: build workflows and run models (credits required if billing is on)
- Staff/Admins: advanced tools, monitoring, and agent management

## Billing & Credits (Optional)
- Model runs consume credits; costs vary by model.
- Purchase credits or subscribe via Stripe.

## AI Input Bar
- Location: bottom center of the editor; can be collapsed or hidden
- Purpose: Describe a workflow in natural language; the app adds suggested nodes and connects them
- Examples: 
  - "Stable Diffusion 3.5 from this prompt, then upscale 4x"
  - "Upload an image, remove background, inpaint sky, then upscale"

## Troubleshooting
- No image appears: ensure output→input connection is present
- Connection fails: connect bottom (output) → top (input)
- Low quality: increase steps or add Upscale
- Wrong result: adjust prompt/negative prompt
- Missing project as a guest: use the same device and browser (local storage)

## Input/Output Compatibility
- Prompt → Image Model: Prompt (text) connects into a model that accepts text input
- Image Upload → Upscale/Inpaint: Image output connects into tools that accept images
- Model Output → Post-Process: Any node producing an image connects into Upscale or Inpaint
- Rule of thumb: outputs (bottom) always feed inputs (top) where the data type matches (text→model, image→image tool)

## Model Connection Recipes
- Prompt to Any Image Model:
  1) Add Prompt and set description
  2) Add your chosen model node (e.g., Stable Diffusion)
  3) Connect Prompt (output) → Model (input)
  4) Generate
- Model to Upscale:
  1) Generate an image from a model
  2) Add Upscale
  3) Connect Model (output) → Upscale (input)
  4) Choose scale and run
- Upload to Inpaint:
  1) Add Image Upload
  2) Add Inpaint
  3) Connect Upload (output) → Inpaint (input)
  4) Write edit prompt and run

## Multi-Model Examples
- Parallel Variations (Prompt → Model A and Model B):
  1) Add one Prompt
  2) Add two model nodes (e.g., SD and an alternative)
  3) Connect Prompt → Model A and Prompt → Model B
  4) Generate both; compare outputs
- Sequential Refinement (Prompt → Model → Upscale → Inpaint):
  1) Prompt → Model (generate)
  2) Model → Upscale (run)
  3) Upscale → Inpaint (edit prompt, run)
- Branch and Compare (Model → Upscale (2x) and Upscale (4x)):
  1) Generate with a model
  2) Add two Upscale nodes
  3) Connect Model → Upscale(2x) and Model → Upscale(4x)
  4) Choose the best result

## Quick Checklist (Before Running)
- Are required connections present (no orphan nodes)?
- Does the input type match the node (text→model, image→image tool)?
- Are node parameters set (prompt, guidance/steps, scale)?
- Is the desired node selected before running?
