/**
 * Vision Engine v2.5 - Action Suggestion Engine
 * 
 * SEMI-AUTONOMOUS MODE:
 * - Vision generates ACTION SUGGESTIONS only
 * - Never executes actions automatically
 * - All suggestions require approval
 * - Hands v4 remains the only executor
 */

import type { ScreenAnalysisResult, UIMapResult } from "./types.js";
import { logToBrain } from "./brainLogger.js";

export interface ActionSuggestion {
  type: "click" | "doubleClick" | "rightClick" | "drag" | "type" | "key" | "menu";
  coordinates?: { x: number; y: number };
  targetCoordinates?: { x: number; y: number };
  text?: string;
  key?: string;
  menuPath?: string[];
  confidence: number;
  reasoning: string;
  targetElement?: string;
  approvalRequired: true;  // ALWAYS TRUE in Semi-Autonomous Mode
}

export interface ActionSuggestionsResult {
  suggestions: ActionSuggestion[];
  screenState: {
    app: string;
    resolution: { width: number; height: number };
    timestamp: string;
  };
  intent: string;
  confidence: number;
  semiAutonomous: true;  // ALWAYS TRUE
  warning: string;  // Warning that actions require approval
}

/**
 * Suggest actions based on screen analysis and user intent
 * NEVER executes - only suggests
 */
export async function suggestActions(
  screenAnalysis: ScreenAnalysisResult,
  uiMap: UIMapResult,
  userIntent: string
): Promise<ActionSuggestionsResult> {
  console.log(`[ActionSuggestion] Analyzing intent: "${userIntent}"`);
  console.log(`[ActionSuggestion] Screen: ${screenAnalysis.app}, UI elements: ${uiMap.elements.length}`);

  const suggestions: ActionSuggestion[] = [];

  // Parse user intent and match with UI elements
  const intent = userIntent.toLowerCase();

  // Example: "click export button"
  if (intent.includes("click") || intent.includes("press")) {
    const targetText = extractTargetFromIntent(intent);
    const matchingElements = uiMap.elements.filter(el => 
      el.label.toLowerCase().includes(targetText.toLowerCase()) ||
      el.text?.toLowerCase().includes(targetText.toLowerCase())
    );

    for (const element of matchingElements.slice(0, 3)) {  // Top 3 matches
      suggestions.push({
        type: "click",
        coordinates: element.center,
        confidence: element.confidence * 0.9,
        reasoning: `Found UI element "${element.label}" at (${element.center.x}, ${element.center.y}) matching intent "${userIntent}"`,
        targetElement: element.label,
        approvalRequired: true
      });
    }
  }

  // Example: "type 'hello world'"
  if (intent.includes("type") || intent.includes("enter")) {
    const textMatch = intent.match(/['"]([^'"]+)['"]/);
    if (textMatch) {
      suggestions.push({
        type: "type",
        text: textMatch[1],
        confidence: 0.95,
        reasoning: `Extracted text "${textMatch[1]}" from intent for typing`,
        approvalRequired: true
      });
    }
  }

  // Example: "open file menu"
  if (intent.includes("menu") || intent.includes("select")) {
    const menuHints = extractMenuPathFromIntent(intent, screenAnalysis.app);
    if (menuHints.length > 0) {
      suggestions.push({
        type: "menu",
        menuPath: menuHints,
        confidence: 0.85,
        reasoning: `Extracted menu path ${menuHints.join(" > ")} for app ${screenAnalysis.app}`,
        approvalRequired: true
      });
    }
  }

  // Example: "drag from X to Y"
  if (intent.includes("drag") || intent.includes("move")) {
    // Extract coordinates if present
    const coordMatch = intent.match(/(\d+),\s*(\d+)\s+to\s+(\d+),\s*(\d+)/);
    if (coordMatch) {
      suggestions.push({
        type: "drag",
        coordinates: { x: parseInt(coordMatch[1]), y: parseInt(coordMatch[2]) },
        targetCoordinates: { x: parseInt(coordMatch[3]), y: parseInt(coordMatch[4]) },
        confidence: 0.9,
        reasoning: `Extracted drag coordinates from intent`,
        approvalRequired: true
      });
    }
  }

  const result: ActionSuggestionsResult = {
    suggestions,
    screenState: {
      app: screenAnalysis.app,
      resolution: screenAnalysis.resolution,
      timestamp: new Date().toISOString()
    },
    intent: userIntent,
    confidence: suggestions.length > 0 ? Math.max(...suggestions.map(s => s.confidence)) : 0,
    semiAutonomous: true,
    warning: "⚠️ Semi-Autonomous Mode: All suggested actions require explicit approval before execution"
  };

  // Log suggestions to Brain
  await logToBrain("codex-vision-suggestions", {
    type: "action_suggestions",
    ts: new Date().toISOString(),
    app: screenAnalysis.app,
    screenState: result.screenState,
    intent: userIntent,
    suggestions: suggestions.map(s => ({
      type: s.type,
      target: s.targetElement || s.coordinates,
      confidence: s.confidence,
      reasoning: s.reasoning
    }))
  });

  return result;
}

/**
 * Extract target element name from user intent
 */
function extractTargetFromIntent(intent: string): string {
  // Remove common verbs
  let cleaned = intent
    .replace(/click|press|tap|select|choose/gi, "")
    .replace(/button|menu|item|option/gi, "")
    .replace(/the|a|an/gi, "")
    .trim();

  return cleaned || "button";
}

/**
 * Extract menu path from intent based on app context
 */
function extractMenuPathFromIntent(intent: string, app: string): string[] {
  const menuPaths: Record<string, Record<string, string[]>> = {
    "Photoshop": {
      "export": ["File", "Export", "Export As"],
      "save": ["File", "Save"],
      "layer": ["Layer", "New", "Layer"]
    },
    "Chrome": {
      "devtools": ["View", "Developer", "Developer Tools"],
      "bookmark": ["Bookmarks", "Bookmark This Page"]
    },
    "Final Cut Pro": {
      "export": ["File", "Share", "Master File"],
      "import": ["File", "Import", "Media"]
    },
    "Finder": {
      "folder": ["File", "New Folder"],
      "info": ["File", "Get Info"]
    }
  };

  // Try to match intent with known menu paths
  for (const [appName, menus] of Object.entries(menuPaths)) {
    if (app.includes(appName)) {
      for (const [keyword, path] of Object.entries(menus)) {
        if (intent.toLowerCase().includes(keyword)) {
          return path;
        }
      }
    }
  }

  return [];
}

/**
 * Validate that an action suggestion is safe
 */
export function validateActionSuggestion(suggestion: ActionSuggestion): { valid: boolean; reason?: string } {
  // Coordinate validation
  if (suggestion.coordinates) {
    if (suggestion.coordinates.x < 0 || suggestion.coordinates.y < 0) {
      return { valid: false, reason: "Coordinates cannot be negative" };
    }
    if (suggestion.coordinates.x > 10000 || suggestion.coordinates.y > 10000) {
      return { valid: false, reason: "Coordinates exceed safe bounds" };
    }
  }

  // Text validation
  if (suggestion.text) {
    const dangerousPatterns = ["rm -rf", "sudo", "chmod", "; rm", "&& rm"];
    for (const pattern of dangerousPatterns) {
      if (suggestion.text.toLowerCase().includes(pattern)) {
        return { valid: false, reason: "Text contains dangerous command patterns" };
      }
    }
  }

  // Confidence threshold
  if (suggestion.confidence < 0.5) {
    return { valid: false, reason: "Confidence below safety threshold (0.5)" };
  }

  return { valid: true };
}
