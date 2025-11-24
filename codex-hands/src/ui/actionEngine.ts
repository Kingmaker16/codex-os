/**
 * Hands v4 — Visual Action Engine
 * 
 * Processes screenshots, coordinates, and semantic actions
 * Returns success/error, confidence, and action description
 * 
 * Will be integrated with Vision Engine v2.5 for coordinate mapping
 */

import * as macosActions from "../native/macosActions.js";

export interface ActionRequest {
  screenshot?: string; // Base64 or file path
  coordinates?: { x: number; y: number };
  semanticAction?: string; // e.g., "click 'Export' button"
  targetApp?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  confidence: number; // 0.0 to 1.0
  actionDescription: string;
  executedAt: string;
  metadata?: {
    coordinates?: { x: number; y: number };
    appName?: string;
    method?: string;
  };
}

/**
 * Execute a visual action based on the request
 */
export async function executeAction(request: ActionRequest): Promise<ActionResult> {
  const startTime = new Date().toISOString();

  try {
    // Case 1: Direct coordinates provided
    if (request.coordinates) {
      const { x, y } = request.coordinates;
      await macosActions.clickXY(x, y);

      return {
        success: true,
        confidence: 1.0,
        actionDescription: `Clicked at (${x}, ${y})`,
        executedAt: startTime,
        metadata: {
          coordinates: { x, y },
          method: "direct-coordinates",
        },
      };
    }

    // Case 2: Semantic action provided (future Vision integration)
    if (request.semanticAction) {
      // TODO: Integrate with Vision Engine v2.5
      // For now, return high confidence placeholder
      return {
        success: false,
        error: "Semantic actions require Vision Engine v2.5 integration (coming soon)",
        confidence: 0.0,
        actionDescription: `Attempted semantic action: ${request.semanticAction}`,
        executedAt: startTime,
        metadata: {
          method: "semantic-vision",
        },
      };
    }

    // Case 3: Screenshot provided (future Vision integration)
    if (request.screenshot) {
      // TODO: Integrate with Vision Engine v2.5
      // - Analyze screenshot
      // - Detect UI elements
      // - Find target coordinates
      // - Execute action
      return {
        success: false,
        error: "Screenshot analysis requires Vision Engine v2.5 integration (coming soon)",
        confidence: 0.0,
        actionDescription: "Attempted screenshot-based action",
        executedAt: startTime,
        metadata: {
          method: "screenshot-analysis",
        },
      };
    }

    // No valid input provided
    return {
      success: false,
      error: "No valid action input provided (coordinates, semanticAction, or screenshot required)",
      confidence: 0.0,
      actionDescription: "No action executed",
      executedAt: startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      confidence: 0.0,
      actionDescription: "Action failed",
      executedAt: startTime,
    };
  }
}

/**
 * Validate action request
 */
export function validateActionRequest(request: ActionRequest): { valid: boolean; error?: string } {
  if (!request.coordinates && !request.semanticAction && !request.screenshot) {
    return {
      valid: false,
      error: "At least one of coordinates, semanticAction, or screenshot must be provided",
    };
  }

  if (request.coordinates) {
    const { x, y } = request.coordinates;
    if (typeof x !== "number" || typeof y !== "number") {
      return { valid: false, error: "Coordinates must be numbers" };
    }
    if (x < 0 || y < 0 || x > 10000 || y > 10000) {
      return { valid: false, error: "Coordinates out of valid range (0-10000)" };
    }
  }

  return { valid: true };
}

/**
 * Execute a double-click action
 */
export async function executeDoubleClick(request: ActionRequest): Promise<ActionResult> {
  const startTime = new Date().toISOString();

  try {
    if (!request.coordinates) {
      return {
        success: false,
        error: "Coordinates required for double-click",
        confidence: 0.0,
        actionDescription: "No coordinates provided",
        executedAt: startTime,
      };
    }

    const { x, y } = request.coordinates;
    await macosActions.doubleClickXY(x, y);

    return {
      success: true,
      confidence: 1.0,
      actionDescription: `Double-clicked at (${x}, ${y})`,
      executedAt: startTime,
      metadata: {
        coordinates: { x, y },
        method: "direct-coordinates",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      confidence: 0.0,
      actionDescription: "Double-click failed",
      executedAt: startTime,
    };
  }
}

/**
 * Execute a right-click action
 */
export async function executeRightClick(request: ActionRequest): Promise<ActionResult> {
  const startTime = new Date().toISOString();

  try {
    if (!request.coordinates) {
      return {
        success: false,
        error: "Coordinates required for right-click",
        confidence: 0.0,
        actionDescription: "No coordinates provided",
        executedAt: startTime,
      };
    }

    const { x, y } = request.coordinates;
    await macosActions.rightClickXY(x, y);

    return {
      success: true,
      confidence: 1.0,
      actionDescription: `Right-clicked at (${x}, ${y})`,
      executedAt: startTime,
      metadata: {
        coordinates: { x, y },
        method: "direct-coordinates",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      confidence: 0.0,
      actionDescription: "Right-click failed",
      executedAt: startTime,
    };
  }
}

/**
 * Execute a drag action
 */
export async function executeDrag(
  from: { x: number; y: number },
  to: { x: number; y: number }
): Promise<ActionResult> {
  const startTime = new Date().toISOString();

  try {
    await macosActions.drag(from.x, from.y, to.x, to.y);

    return {
      success: true,
      confidence: 1.0,
      actionDescription: `Dragged from (${from.x}, ${from.y}) to (${to.x}, ${to.y})`,
      executedAt: startTime,
      metadata: {
        coordinates: from,
        method: "direct-coordinates",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      confidence: 0.0,
      actionDescription: "Drag failed",
      executedAt: startTime,
    };
  }
}
