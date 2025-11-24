/**
 * Vision Engine v2 - UI Mapper
 * 
 * Build pixel → semantic maps for UI automation
 */

import type { UIMapRequest, UIMapResult, UIRegion, UIElement } from "./types.js";
import { CONFIG, type UIProfile } from "./config.js";
import { runVisionFusion } from "./fusionEngine.js";

/**
 * Map UI elements to semantic regions
 */
export async function mapUI(request: UIMapRequest): Promise<UIMapResult> {
  console.log(`[UIMapper] Mapping UI for profile: ${request.profile}`);

  const profile = CONFIG.uiProfiles[request.profile as UIProfile];
  if (!profile) {
    throw new Error(`Unknown UI profile: ${request.profile}`);
  }

  const prompt = `Analyze this ${request.profile} screenshot and identify:
1. Toolbars: ${profile.toolbars.join(", ")}
2. Panels: ${profile.panels.join(", ")}
3. Main canvas/work area: ${profile.canvas}
4. All interactive elements (buttons, menus, controls)

Provide pixel coordinates if possible. Be specific about element locations.`;

  const fusion = await runVisionFusion({
    image: request.screenshot,
    prompt
  });

  // Parse response into structured regions
  const toolbars: UIRegion[] = profile.toolbars.map(name => ({
    name,
    boundingBox: estimateRegionBounds(name, fusion.result),
    elements: []
  }));

  const panels: UIRegion[] = profile.panels.map(name => ({
    name,
    boundingBox: estimateRegionBounds(name, fusion.result),
    elements: []
  }));

  const canvas: UIRegion = {
    name: profile.canvas,
    boundingBox: estimateRegionBounds(profile.canvas, fusion.result),
    elements: []
  };

  // Extract interactable elements
  const interactables: UIElement[] = extractInteractables(fusion.result);

  // Combine all elements
  const allElements = [
    ...interactables,
    ...toolbars.flatMap(t => t.elements),
    ...panels.flatMap(p => p.elements),
    ...canvas.elements
  ];

  return {
    elements: allElements,  // All interactive elements
    toolbars,
    panels,
    canvas,
    interactables
  };
}

/**
 * Estimate region bounds from analysis text
 */
function estimateRegionBounds(regionName: string, analysisText: string): { x: number; y: number; width: number; height: number } {
  // Parse coordinates from text (e.g., "toolbar at top (0, 0, 1920, 80)")
  const pattern = new RegExp(`${regionName}.*?\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(\\d+)\\)`, "i");
  const match = analysisText.match(pattern);

  if (match) {
    return {
      x: parseInt(match[1]),
      y: parseInt(match[2]),
      width: parseInt(match[3]),
      height: parseInt(match[4])
    };
  }

  // Default bounds based on common UI patterns
  const defaults: Record<string, any> = {
    top: { x: 0, y: 0, width: 1920, height: 80 },
    left: { x: 0, y: 80, width: 300, height: 1000 },
    right: { x: 1620, y: 80, width: 300, height: 1000 },
    center: { x: 300, y: 80, width: 1320, height: 1000 },
    bottom: { x: 0, y: 1000, width: 1920, height: 80 }
  };

  for (const [pos, bounds] of Object.entries(defaults)) {
    if (regionName.toLowerCase().includes(pos)) {
      return bounds;
    }
  }

  return { x: 0, y: 0, width: 100, height: 100 };
}

/**
 * Extract interactable UI elements
 */
function extractInteractables(text: string): UIElement[] {
  const elements: UIElement[] = [];
  const lines = text.split("\n");

  const patterns = [
    { type: "button" as const, regex: /button|btn/i },
    { type: "menu" as const, regex: /menu|dropdown/i },
    { type: "toolbar" as const, regex: /toolbar/i },
    { type: "panel" as const, regex: /panel/i },
    { type: "input" as const, regex: /input|text\s*field/i }
  ];

  for (const line of lines) {
    for (const { type, regex } of patterns) {
      if (regex.test(line)) {
        const bbox = { x: 0, y: 0, width: 100, height: 40 };
        elements.push({
          type,
          label: line.trim(),
          text: line.trim(),
          boundingBox: bbox,
          center: { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 },
          clickable: true,
          confidence: 0.75
        });
      }
    }
  }

  return elements;
}
