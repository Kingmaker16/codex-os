/**
 * Hands v4.6 — Adobe Photoshop Automation
 * 
 * Professional image editing operations for Photoshop
 */

import * as macosActions from "../native/macosActions.js";
import { analyzeScreenWithVision } from "../uiVision.js";

export interface DocumentParams {
  width: number;
  height: number;
  resolution?: number;
  mode?: "RGB" | "CMYK" | "Grayscale";
  name?: string;
}

export interface TextParams {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface ResizeParams {
  width: number;
  height: number;
  maintainAspect?: boolean;
  resampleMethod?: string;
}

export interface ExportParams {
  path: string;
  format?: "PNG" | "JPEG" | "PSD" | "TIFF";
  quality?: number;
}

/**
 * Open Photoshop and optionally load a document
 */
export async function openDocument(documentPath?: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Opening Photoshop${documentPath ? ` with document: ${documentPath}` : ''}`);
  
  try {
    // Launch Photoshop
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for app to load

    if (documentPath) {
      // File → Open
      await macosActions.selectMenu("Adobe Photoshop", ["File", "Open..."]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Type path in dialog
      await macosActions.typeText(documentPath);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Press Enter to open
      await macosActions.keyPress("return");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for document to load
    }

    console.log(`[Photoshop] Opened successfully`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Open failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Create a new document
 */
export async function newDocument(params: DocumentParams): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Creating new document: ${params.width}x${params.height}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Command+N for new document
    await macosActions.selectMenu("Adobe Photoshop", ["File", "New..."]);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Type dimensions
    await macosActions.typeText(params.width.toString());
    await macosActions.keyPress("tab");
    await new Promise(resolve => setTimeout(resolve, 200));
    
    await macosActions.typeText(params.height.toString());
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press Enter to create
    await macosActions.keyPress("return");
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[Photoshop] Document created`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] New document failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Import/place an image into current document
 */
export async function importImage(imagePath: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Importing image: ${imagePath}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // File → Place Embedded
    await macosActions.selectMenu("Adobe Photoshop", ["File", "Place Embedded..."]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Type path
    await macosActions.typeText(imagePath);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press Enter to place
    await macosActions.keyPress("return");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Press Enter again to confirm placement
    await macosActions.keyPress("return");
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[Photoshop] Image imported`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Import failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Remove background from current layer (using AI)
 */
export async function removeBackground(): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Removing background`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Select → Subject (AI selection)
    await macosActions.selectMenu("Adobe Photoshop", ["Select", "Subject"]);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for AI processing

    // Select → Inverse
    await macosActions.selectMenu("Adobe Photoshop", ["Select", "Inverse"]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Delete
    await macosActions.keyPress("delete");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Deselect
    await macosActions.selectMenu("Adobe Photoshop", ["Select", "Deselect"]);
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`[Photoshop] Background removed`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Remove background failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Add text layer at specified position
 */
export async function addText(params: TextParams): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Adding text: "${params.text}" at (${params.x}, ${params.y})`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Select Text Tool (T)
    await macosActions.keyPress("t");
    await new Promise(resolve => setTimeout(resolve, 300));

    // Click at position to create text layer
    await macosActions.clickXY(params.x, params.y);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Type text
    await macosActions.typeText(params.text);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Escape to finish editing
    await macosActions.keyPress("escape");
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`[Photoshop] Text added`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Add text failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Apply filter to current layer
 */
export async function applyFilter(filterName: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Applying filter: ${filterName}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Common filters via menu
    const filterPaths: Record<string, string[]> = {
      "Gaussian Blur": ["Filter", "Blur", "Gaussian Blur..."],
      "Sharpen": ["Filter", "Sharpen", "Sharpen"],
      "Unsharp Mask": ["Filter", "Sharpen", "Unsharp Mask..."],
      "Brightness/Contrast": ["Image", "Adjustments", "Brightness/Contrast..."],
      "Hue/Saturation": ["Image", "Adjustments", "Hue/Saturation..."],
    };

    const menuPath = filterPaths[filterName];
    if (menuPath) {
      await macosActions.selectMenu("Adobe Photoshop", menuPath);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Press Enter to apply with default settings
      await macosActions.keyPress("return");
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`[Photoshop] Filter applied: ${filterName}`);
      return { ok: true };
    } else {
      console.log(`[Photoshop] Filter not found in menu paths: ${filterName}`);
      return { ok: false, error: `Filter not found: ${filterName}` };
    }
  } catch (error: any) {
    console.error(`[Photoshop] Filter application failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Resize image/canvas
 */
export async function resize(params: ResizeParams): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Resizing to ${params.width}x${params.height}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Image → Image Size
    await macosActions.selectMenu("Adobe Photoshop", ["Image", "Image Size..."]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Type width
    await macosActions.typeText(params.width.toString());
    await macosActions.keyPress("tab");
    await new Promise(resolve => setTimeout(resolve, 200));

    // Type height
    await macosActions.typeText(params.height.toString());
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press Enter to apply
    await macosActions.keyPress("return");
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[Photoshop] Resize completed`);
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Resize failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Export document to file
 */
export async function exportDocument(params: ExportParams): Promise<{ ok: boolean; outputPath?: string; error?: string }> {
  console.log(`[Photoshop] Exporting to: ${params.path}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 500));

    // File → Export → Quick Export as PNG (or other format)
    const format = params.format || "PNG";
    
    if (format === "PNG") {
      await macosActions.selectMenu("Adobe Photoshop", ["File", "Export", "Quick Export as PNG"]);
    } else {
      await macosActions.selectMenu("Adobe Photoshop", ["File", "Export", "Export As..."]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Type path in save dialog
    await macosActions.typeText(params.path);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press Enter to export
    await macosActions.keyPress("return");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for export

    console.log(`[Photoshop] Export completed`);
    return { ok: true, outputPath: params.path };
  } catch (error: any) {
    console.error(`[Photoshop] Export failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Detect layers panel and list layers
 */
export async function detectLayers(): Promise<{ layers: string[]; error?: string }> {
  console.log(`[Photoshop] Detecting layers`);
  
  try {
    const result = await analyzeScreenWithVision(
      "List all layer names visible in the Adobe Photoshop Layers panel"
    );

    // TODO: Parse layer names from Vision response
    
    return { layers: ["Background", "Layer 1"] };
  } catch (error: any) {
    console.error(`[Photoshop] Layer detection failed:`, error);
    return { layers: [], error: error.message };
  }
}

/**
 * Detect tools in toolbar
 */
export async function detectTools(): Promise<{ tools: string[]; coordinates: any }> {
  console.log(`[Photoshop] Detecting tools`);
  
  try {
    const result = await analyzeScreenWithVision(
      "Identify all tool icons visible in the Adobe Photoshop toolbar. Return their names and approximate locations."
    );

    // TODO: Parse tool names and coordinates from Vision
    
    return {
      tools: ["Move", "Select", "Brush", "Text", "Crop"],
      coordinates: {}
    };
  } catch (error: any) {
    console.error(`[Photoshop] Tool detection failed:`, error);
    return { tools: [], coordinates: {} };
  }
}

/**
 * Click on specific UI element or coordinates
 */
export async function click(target: string | { x: number; y: number }): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Clicking:`, target);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 300));

    if (typeof target === "string") {
      // Named target - use Vision to find it
      const result = await analyzeScreenWithVision(
        `Find the "${target}" element in Adobe Photoshop UI. Return coordinates.`
      );
      // TODO: Parse coordinates and click
      console.log(`[Photoshop] Vision-based click stub for: ${target}`);
    } else {
      // Direct coordinates
      await macosActions.clickXY(target.x, target.y);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Click failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Drag operation (for tools, selections, etc.)
 */
export async function drag(start: { x: number; y: number }, end: { x: number; y: number }): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Dragging from (${start.x},${start.y}) to (${end.x},${end.y})`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 300));

    // Click start position, move to end
    await macosActions.clickXY(start.x, start.y);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Placeholder: just click destination (proper drag needs cliclick or AppleScript)
    await macosActions.clickXY(end.x, end.y);

    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Drag failed:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Execute keyboard shortcut
 */
export async function keyboardShortcut(combo: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[Photoshop] Keyboard shortcut: ${combo}`);
  
  try {
    await macosActions.focusApp("Adobe Photoshop");
    await new Promise(resolve => setTimeout(resolve, 300));

    // Parse combo (e.g., "Command+S", "Ctrl+T")
    const key = combo.split("+").pop() || combo;
    await macosActions.keyPress(key.toLowerCase());

    return { ok: true };
  } catch (error: any) {
    console.error(`[Photoshop] Keyboard shortcut failed:`, error);
    return { ok: false, error: error.message };
  }
}
