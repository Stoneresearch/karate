# Workflow Editor Guide

The **Editor** is the workspace where you construct AI generation pipelines.

## Core Concepts

### Nodes
A **Node** is a functional block.
-   **Model Nodes**: Generate content (e.g., Flux Pro, Stable Diffusion).
-   **Input Nodes**: Provide data (e.g., Prompt, Image Upload).
-   **Tool Nodes**: Modify content (e.g., Upscale, Remove Background).

### Edges
**Edges** (wires) connect nodes. Data flows from **Left/Top** (Outputs) to **Right/Bottom** (Inputs).
-   Connect a **Prompt** node to a **Model** node to control what it generates.
-   Connect a **Model** node to an **Upscale** node to enhance the result.

## Interface Tour

### 1. The Canvas
-   **Pan**: Click & Drag on empty space.
-   **Zoom**: Mouse Wheel / Trackpad pinch.
-   **Context Menu**: Right-click anywhere to quickly add nodes.

### 2. The Sidebar (Left)
Contains the library of available nodes, categorized by type:
-   **Image Gen**: Models like Flux, SD3.5, DALL-E.
-   **Video Gen**: Runway, Luma, Kling.
-   **Tools**: Editing utilities.

### 3. The Header (Top)
-   **Project Title**: Click to rename.
-   **Run Button**: (Note: Individual nodes have their own run buttons).
-   **Credit Balance**: Displays your current available credits.

### 4. The Assistant Dock (Bottom)
A natural language AI helper.
-   Type: *"Create a workflow that generates a cyberpunk city and then upscales it."*
-   Result: The AI will automatically place and connect the required nodes for you.

## Running a Workflow
1.  Ensure all required inputs (like Prompts) are connected or filled in.
2.  Click the **Generate** (or Run) button on the specific Model Node you want to execute.
3.  The node will show a "Processing" state.
4.  Once complete, the result (Image/Video) appears directly on the node.
5.  **Note**: Every run costs credits. If you are out of credits, the run will fail with an error.

## Node Settings
Select a node or look for the gear icon to access advanced settings:
-   **Aspect Ratio**: Change dimensions (Landscape, Portrait, Square).
-   **Guidance Scale**: How closely the model follows the prompt.
-   **Seed**: Fixed number for reproducible results.
