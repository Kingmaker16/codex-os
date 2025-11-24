/**
 * Hands v4 — Safety Guard
 * 
 * Validates all automation actions to ensure:
 * - Touch events stay within allowed coordinate ranges
 * - Apps are in whitelist
 * - System preferences, Terminal, and security apps are blocked
 */

import { getScreenResolution } from "../native/macosActions.js";

// Allowed applications for automation
const ALLOWED_APPS = [
  "Adobe Photoshop",
  "Adobe Photoshop 2024",
  "Adobe Photoshop 2025",
  "Google Chrome",
  "Safari",
  "Final Cut Pro",
  "Logic Pro",
  "Logic Pro X",
  "Adobe Premiere Pro",
  "Finder",
  "CapCut",
  "Photos",
  "Preview",
  "Visual Studio Code",
  "Spotify",
  // Gmail is accessed via browser (Chrome/Safari)
];

// Blocked applications (system/security critical)
const BLOCKED_APPS = [
  "Terminal",
  "iTerm",
  "System Preferences",
  "System Settings",
  "Security & Privacy",
  "Password",
  "Keychain Access",
  "Activity Monitor",
  "Console",
  "Disk Utility",
  "Migration Assistant",
  "Boot Camp Assistant",
  "Time Machine",
];

// Blocked menu paths (dangerous operations)
const BLOCKED_MENU_PATHS = [
  ["System Preferences"],
  ["System Settings"],
  ["Security"],
  ["Privacy"],
  ["Keychain"],
];

export interface HandsAction {
  type: "click" | "doubleClick" | "rightClick" | "drag" | "type" | "keyPress" | "menu" | "video.open" | "video.edit" | "video.export" | "video.captions";
  coordinates?: { x: number; y: number };
  targetCoordinates?: { x: number; y: number };
  appName?: string;
  text?: string;
  key?: string;
  menuPath?: string[];
  filePath?: string; // For video export validation
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validate if an app is allowed for automation
 */
export function isAppAllowed(appName: string): boolean {
  // Check if explicitly blocked
  for (const blocked of BLOCKED_APPS) {
    if (appName.toLowerCase().includes(blocked.toLowerCase())) {
      return false;
    }
  }

  // Check if explicitly allowed
  for (const allowed of ALLOWED_APPS) {
    if (appName.toLowerCase().includes(allowed.toLowerCase())) {
      return true;
    }
  }

  // Default deny for unknown apps
  return false;
}

/**
 * Validate coordinates are within safe screen bounds
 */
export async function validateCoordinates(x: number, y: number): Promise<ValidationResult> {
  // Basic range check
  if (x < 0 || y < 0) {
    return {
      allowed: false,
      reason: "Coordinates cannot be negative",
    };
  }

  // Check against actual screen resolution
  try {
    const { width, height } = await getScreenResolution();
    
    if (x > width || y > height) {
      return {
        allowed: false,
        reason: `Coordinates (${x}, ${y}) exceed screen bounds (${width}x${height})`,
      };
    }
  } catch (error) {
    // If we can't get screen resolution, use conservative bounds
    if (x > 5000 || y > 5000) {
      return {
        allowed: false,
        reason: "Coordinates exceed maximum safe bounds",
      };
    }
  }

  return { allowed: true };
}

/**
 * Validate menu path doesn't contain blocked items
 */
export function validateMenuPath(menuPath: string[]): ValidationResult {
  for (const blocked of BLOCKED_MENU_PATHS) {
    const matches = blocked.every((item, idx) => 
      menuPath[idx]?.toLowerCase().includes(item.toLowerCase())
    );
    
    if (matches) {
      return {
        allowed: false,
        reason: `Menu path "${menuPath.join(" > ")}" is blocked for safety`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Validate a Hands action before execution
 */
export async function validateHandsAction(action: HandsAction): Promise<ValidationResult> {
  // Validate app if provided
  if (action.appName) {
    if (!isAppAllowed(action.appName)) {
      return {
        allowed: false,
        reason: `App "${action.appName}" is not in the allowed list or is blocked for safety`,
      };
    }
  }

  // Validate coordinates
  if (action.coordinates) {
    const coordValidation = await validateCoordinates(action.coordinates.x, action.coordinates.y);
    if (!coordValidation.allowed) {
      return coordValidation;
    }
  }

  // Validate target coordinates (for drag)
  if (action.targetCoordinates) {
    const targetValidation = await validateCoordinates(
      action.targetCoordinates.x,
      action.targetCoordinates.y
    );
    if (!targetValidation.allowed) {
      return targetValidation;
    }
  }

  // Validate menu path
  if (action.menuPath) {
    const menuValidation = validateMenuPath(action.menuPath);
    if (!menuValidation.allowed) {
      return menuValidation;
    }
  }

  // Validate text input (basic sanitization)
  if (action.text) {
    // Block potentially dangerous shell commands or scripts
    const dangerousPatterns = [
      "rm -rf",
      "sudo",
      "chmod",
      "chown",
      "; rm",
      "&& rm",
      "| rm",
      ">/dev/",
    ];

    for (const pattern of dangerousPatterns) {
      if (action.text.toLowerCase().includes(pattern)) {
        return {
          allowed: false,
          reason: "Text contains potentially dangerous command patterns",
        };
      }
    }
  }

  // Validate video operations (Hands v4.5)
  if (action.type.startsWith("video.")) {
    // Validate export paths stay within safe root
    if (action.type === "video.export" && action.filePath) {
      const SAFE_ROOT = process.env.HOME || "/Users";
      const safePaths = [
        `${SAFE_ROOT}/Desktop`,
        `${SAFE_ROOT}/Documents`,
        `${SAFE_ROOT}/Movies`,
        `${SAFE_ROOT}/Downloads`,
        "/tmp",
      ];

      const isPathSafe = safePaths.some((safePath) =>
        action.filePath!.startsWith(safePath)
      );

      if (!isPathSafe) {
        return {
          allowed: false,
          reason: "Export path must be within safe directories (Desktop, Documents, Movies, Downloads, /tmp)",
        };
      }
    }
  }

  // All checks passed
  return { allowed: true };
}

/**
 * Get list of allowed apps
 */
export function getAllowedApps(): string[] {
  return [...ALLOWED_APPS];
}

/**
 * Get list of blocked apps
 */
export function getBlockedApps(): string[] {
  return [...BLOCKED_APPS];
}
