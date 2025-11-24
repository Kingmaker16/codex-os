/**
 * Vision Engine v2 - Screen Analyzer
 * 
 * Analyze screenshots for UI elements, text, and click targets
 */

import type { ScreenAnalysisRequest, ScreenAnalysisResult, UIElement, ClickTarget, ExtractedText } from "./types.js";
import { runVisionFusion, extractTextVision } from "./fusionEngine.js";

/**
 * Analyze screenshot for UI elements and interactables
 */
export async function analyzeScreen(request: ScreenAnalysisRequest): Promise<ScreenAnalysisResult> {
  console.log("[ScreenAnalyzer] Analyzing screenshot");

  // Run vision fusion for UI analysis
  const prompt = `Analyze this screenshot and identify:
1. The application name
2. Screen resolution
3. All UI elements (buttons, menus, toolbars, panels, inputs)
4. Text blocks and labels
5. Clickable targets with coordinates
6. Suggested user actions

Format your response as structured data where possible.`;

  const fusion = await runVisionFusion({
    image: request.screenshot,
    prompt
  });

  // Extract text using vision OCR
  const extractedText = await extractTextVision(request.screenshot);

  // Detect app and resolution
  const appName = detectAppName(fusion.result, request.profile);
  const resolution = detectResolution(request.screenshot);

  // Parse fusion result for UI elements
  const uiElements: UIElement[] = parseUIElements(fusion.result);
  const textBlocks: ExtractedText[] = parseTextBlocks(extractedText);
  const clickTargets: ClickTarget[] = parseClickTargets(fusion.result);
  const suggestedActions: string[] = parseSuggestedActions(fusion.result);

  return {
    app: appName,
    resolution,
    uiElements,
    textBlocks,
    clickTargets,
    suggestedActions,
    profile: request.profile,
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse UI elements from analysis text
 */
function parseUIElements(text: string): UIElement[] {
  const elements: UIElement[] = [];
  const lines = text.split("\n");

  const keywords = {
    button: /button|btn|click/i,
    menu: /menu|dropdown/i,
    toolbar: /toolbar|tool bar/i,
    panel: /panel|sidebar/i,
    input: /input|textbox|field/i
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    for (const [type, regex] of Object.entries(keywords)) {
      if (regex.test(lower)) {
        const bbox = { x: 0, y: 0, width: 100, height: 30 };
        elements.push({
          type: type as any,
          label: line.trim(),
          text: line.trim(),
          boundingBox: bbox,
          center: { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 },
          clickable: type === "button" || type === "menu",
          confidence: 0.8
        });
      }
    }
  }

  return elements;
}

/**
 * Detect app name from analysis text
 */
function detectAppName(text: string, profile?: string): string {
  const appPatterns: Record<string, RegExp> = {
    "Adobe Photoshop": /photoshop|ps|adobe/i,
    "Final Cut Pro": /final\s*cut/i,
    "Logic Pro": /logic\s*pro/i,
    "Google Chrome": /chrome|browser/i,
    "Safari": /safari/i,
    "Finder": /finder/i,
    "CapCut": /capcut/i
  };

  for (const [appName, pattern] of Object.entries(appPatterns)) {
    if (pattern.test(text) || (profile && pattern.test(profile))) {
      return appName;
    }
  }

  return profile || "Unknown App";
}

/**
 * Detect screen resolution from base64 image
 */
function detectResolution(base64Image: string): { width: number; height: number } {
  // Default resolution if we can't determine
  // In production, decode image header or use system info
  return { width: 1920, height: 1080 };
}

/**
 * Parse text blocks
 */
function parseTextBlocks(text: string): ExtractedText[] {
  const blocks = text.split("\n").filter(line => line.trim().length > 0);
  
  return blocks.map(block => ({
    text: block.trim(),
    confidence: 0.9,
    boundingBox: { x: 0, y: 0, width: 0, height: 0 }
  }));
}

/**
 * Parse click targets
 */
function parseClickTargets(text: string): ClickTarget[] {
  const targets: ClickTarget[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.toLowerCase().includes("click") || line.toLowerCase().includes("button")) {
      targets.push({
        label: line.trim(),
        x: 0,
        y: 0,
        action: "click"
      });
    }
  }

  return targets;
}

/**
 * Parse suggested actions
 */
function parseSuggestedActions(text: string): string[] {
  const actions: string[] = [];
  const sentences = text.split(/[.!?]/);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (
      lower.includes("should") ||
      lower.includes("can") ||
      lower.includes("suggest") ||
      lower.includes("try") ||
      lower.includes("next")
    ) {
      actions.push(sentence.trim());
    }
  }

  return actions.slice(0, 5);
}
