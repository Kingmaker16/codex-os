/**
 * Hands v4.6 — Adobe Suite Safety Layer
 * 
 * Validates Adobe operations for security and correctness
 */

export interface AdobeAction {
  type: string;
  app: string;
  action?: string;
  filePath?: string;
  params?: any;
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

// Safe directories for Adobe file operations
const SAFE_ROOT = process.env.HOME || "/Users";
const SAFE_PATHS = [
  `${SAFE_ROOT}/Desktop`,
  `${SAFE_ROOT}/Documents`,
  `${SAFE_ROOT}/Movies`,
  `${SAFE_ROOT}/Pictures`,
  `${SAFE_ROOT}/Downloads`,
  "/tmp",
];

// Allowed Adobe applications
const ALLOWED_ADOBE_APPS = [
  "premiere",
  "Adobe Premiere Pro",
  "photoshop",
  "Adobe Photoshop",
  "Adobe Photoshop 2024",
  "Adobe Photoshop 2025",
];

// Dangerous operations that require extra validation
const DANGEROUS_OPERATIONS = [
  "deleteProject",
  "deleteLayer",
  "closeWithoutSaving",
  "overwriteFile",
];

/**
 * Validate if an Adobe app is allowed
 */
export function isAdobeAppAllowed(appName: string): boolean {
  const normalized = appName.toLowerCase();
  return ALLOWED_ADOBE_APPS.some(allowed => 
    allowed.toLowerCase().includes(normalized) || normalized.includes(allowed.toLowerCase())
  );
}

/**
 * Validate file path is within safe directories
 */
export function isPathSafe(filePath: string): boolean {
  if (!filePath) return true; // No path = no risk
  
  // Resolve to absolute path
  const absolutePath = filePath.startsWith("/") ? filePath : `${SAFE_ROOT}/${filePath}`;
  
  // Check if within safe directories
  return SAFE_PATHS.some(safePath => absolutePath.startsWith(safePath));
}

/**
 * Validate tool/action name is recognized
 */
export function isActionValid(action: string): boolean {
  if (!action) return true;
  
  // Known Premiere actions
  const premiereActions = [
    "newSequence", "importMedia", "placeOnTimeline", "trimClip", "splitClip",
    "rippleDelete", "addTransition", "applyColorPreset", "detectPanels",
    "locateTool", "click", "drag", "keyboardShortcut"
  ];
  
  // Known Photoshop actions
  const photoshopActions = [
    "newDocument", "importImage", "removeBackground", "addText", "applyFilter",
    "resize", "detectLayers", "detectTools", "click", "drag", "keyboardShortcut"
  ];
  
  const allActions = [...premiereActions, ...photoshopActions];
  return allActions.includes(action);
}

/**
 * Validate Adobe action before execution
 */
export async function validateAdobeAction(action: AdobeAction): Promise<ValidationResult> {
  // Validate app is allowed
  if (!isAdobeAppAllowed(action.app)) {
    return {
      allowed: false,
      reason: `Adobe app not allowed: ${action.app}. Use 'premiere' or 'photoshop'`,
    };
  }

  // Validate file path if provided
  if (action.filePath && !isPathSafe(action.filePath)) {
    return {
      allowed: false,
      reason: `File path outside safe directories: ${action.filePath}. Must be in Desktop, Documents, Movies, Pictures, Downloads, or /tmp`,
    };
  }

  // Validate action is recognized
  if (action.action && !isActionValid(action.action)) {
    return {
      allowed: false,
      reason: `Unknown action: ${action.action}. Check API documentation for valid actions`,
    };
  }

  // Block dangerous operations without confirmation
  if (action.action && DANGEROUS_OPERATIONS.includes(action.action)) {
    // TODO: Implement confirmation mechanism
    return {
      allowed: false,
      reason: `Dangerous operation requires confirmation: ${action.action}`,
    };
  }

  // Validate export operations
  if (action.type.includes("export")) {
    if (!action.filePath) {
      return {
        allowed: false,
        reason: "Export operations require output path",
      };
    }
    
    if (!isPathSafe(action.filePath)) {
      return {
        allowed: false,
        reason: "Export path must be within safe directories",
      };
    }
  }

  // All checks passed
  return { allowed: true };
}

/**
 * Ensure Adobe app is frontmost before automation
 */
export async function ensureAppFrontmost(appName: string): Promise<boolean> {
  try {
    const { frontmostApp, focusApp } = await import("../native/macosActions.js");
    const currentApp = await frontmostApp();
    
    const normalized = appName.toLowerCase();
    const isFrontmost = currentApp.toLowerCase().includes(normalized);
    
    if (!isFrontmost) {
      // Try to focus the app
      const fullAppName = normalized.includes("premiere") ? "Adobe Premiere Pro" : "Adobe Photoshop";
      await focusApp(fullAppName);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return true;
  } catch (error) {
    console.error(`[Adobe Safety] Failed to ensure app frontmost:`, error);
    return false;
  }
}

/**
 * Get list of safe paths for exports
 */
export function getSafePaths(): string[] {
  return [...SAFE_PATHS];
}

/**
 * Get list of allowed Adobe apps
 */
export function getAllowedAdobeApps(): string[] {
  return [...ALLOWED_ADOBE_APPS];
}
