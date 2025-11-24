/**
 * Hands v4 — macOS Automation Layer
 * 
 * Provides native macOS automation using:
 * - AppleScript (via osascript)
 * - open command
 * - cliclick fallback (if installed)
 * - Vision → coordinate mapping integration (added later)
 * 
 * All actions are validated for macOS safety.
 */

import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Execute AppleScript code safely
 */
async function runAppleScript(script: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    if (stderr) {
      console.warn("[macosActions] AppleScript stderr:", stderr);
    }
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`AppleScript failed: ${error.message}`);
  }
}

/**
 * Check if cliclick is installed
 */
let cliclickAvailable: boolean | null = null;
async function hasCliclick(): Promise<boolean> {
  if (cliclickAvailable !== null) return cliclickAvailable;
  
  try {
    await execAsync("which cliclick");
    cliclickAvailable = true;
    return true;
  } catch {
    cliclickAvailable = false;
    return false;
  }
}

/**
 * Click at specific coordinates
 */
export async function clickXY(x: number, y: number): Promise<void> {
  // Validate coordinates (basic screen bounds check)
  if (x < 0 || y < 0 || x > 10000 || y > 10000) {
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }

  if (await hasCliclick()) {
    // Use cliclick if available (more reliable)
    await execAsync(`cliclick c:${x},${y}`);
  } else {
    // Fallback to AppleScript
    const script = `
      tell application "System Events"
        set frontmost of first process whose frontmost is true to true
        click at {${x}, ${y}}
      end tell
    `;
    await runAppleScript(script);
  }
}

/**
 * Double-click at specific coordinates
 */
export async function doubleClickXY(x: number, y: number): Promise<void> {
  if (x < 0 || y < 0 || x > 10000 || y > 10000) {
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }

  if (await hasCliclick()) {
    await execAsync(`cliclick dc:${x},${y}`);
  } else {
    const script = `
      tell application "System Events"
        set frontmost of first process whose frontmost is true to true
        click at {${x}, ${y}}
        delay 0.1
        click at {${x}, ${y}}
      end tell
    `;
    await runAppleScript(script);
  }
}

/**
 * Right-click at specific coordinates
 */
export async function rightClickXY(x: number, y: number): Promise<void> {
  if (x < 0 || y < 0 || x > 10000 || y > 10000) {
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }

  if (await hasCliclick()) {
    await execAsync(`cliclick rc:${x},${y}`);
  } else {
    const script = `
      tell application "System Events"
        set frontmost of first process whose frontmost is true to true
        do shell script "osascript -e 'tell application \\"System Events\\" to right click at {${x}, ${y}}'"
      end tell
    `;
    await runAppleScript(script);
  }
}

/**
 * Drag from one point to another
 */
export async function drag(fromX: number, fromY: number, toX: number, toY: number): Promise<void> {
  // Validate all coordinates
  if (fromX < 0 || fromY < 0 || toX < 0 || toY < 0) {
    throw new Error(`Invalid drag coordinates`);
  }
  if (fromX > 10000 || fromY > 10000 || toX > 10000 || toY > 10000) {
    throw new Error(`Invalid drag coordinates`);
  }

  if (await hasCliclick()) {
    await execAsync(`cliclick m:${fromX},${fromY} dd:${fromX},${fromY} du:${toX},${toY}`);
  } else {
    // AppleScript drag is complex, use multiple steps
    const script = `
      tell application "System Events"
        set frontmost of first process whose frontmost is true to true
        set startPoint to {${fromX}, ${fromY}}
        set endPoint to {${toX}, ${toY}}
        
        -- Move to start position
        do shell script "osascript -e 'tell application \\"System Events\\" to set mouse location to {${fromX}, ${fromY}}'"
        delay 0.1
        
        -- Press and hold
        do shell script "osascript -e 'tell application \\"System Events\\" to mouse down at {${fromX}, ${fromY}}'"
        delay 0.2
        
        -- Move to end position
        do shell script "osascript -e 'tell application \\"System Events\\" to set mouse location to {${toX}, ${toY}}'"
        delay 0.1
        
        -- Release
        do shell script "osascript -e 'tell application \\"System Events\\" to mouse up at {${toX}, ${toY}}'"
      end tell
    `;
    await runAppleScript(script);
  }
}

/**
 * Press a keyboard key
 * Supports: return, tab, space, escape, delete, up, down, left, right, command, shift, control, option
 */
export async function keyPress(key: string): Promise<void> {
  const validKeys = [
    "return", "tab", "space", "escape", "delete",
    "up", "down", "left", "right",
    "command", "shift", "control", "option",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
  ];

  const normalizedKey = key.toLowerCase();
  if (!validKeys.includes(normalizedKey)) {
    throw new Error(`Invalid key: ${key}. Must be one of: ${validKeys.join(", ")}`);
  }

  const script = `
    tell application "System Events"
      key code ${getKeyCode(normalizedKey)}
    end tell
  `;
  await runAppleScript(script);
}

/**
 * Map key names to macOS key codes
 */
function getKeyCode(key: string): string {
  const keyCodes: Record<string, string> = {
    "a": "0", "s": "1", "d": "2", "f": "3", "h": "4", "g": "5", "z": "6",
    "x": "7", "c": "8", "v": "9", "b": "11", "q": "12", "w": "13", "e": "14",
    "r": "15", "y": "16", "t": "17", "1": "18", "2": "19", "3": "20", "4": "21",
    "6": "22", "5": "23", "=": "24", "9": "25", "7": "26", "-": "27", "8": "28",
    "0": "29", "]": "30", "o": "31", "u": "32", "[": "33", "i": "34", "p": "35",
    "return": "36", "l": "37", "j": "38", "\"": "39", "k": "40", ";": "41",
    "\\": "42", ",": "43", "/": "44", "n": "45", "m": "46", ".": "47",
    "tab": "48", "space": "49", "`": "50", "delete": "51", "escape": "53",
    "command": "55", "shift": "56", "control": "59", "option": "58",
    "left": "123", "right": "124", "down": "125", "up": "126"
  };

  return keyCodes[key] || "49"; // Default to space if not found
}

/**
 * Type text with proper escaping
 */
export async function typeText(text: string): Promise<void> {
  if (!text || text.length === 0) {
    throw new Error("Text cannot be empty");
  }

  // Escape special characters for AppleScript
  const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const script = `
    tell application "System Events"
      keystroke "${escaped}"
    end tell
  `;
  await runAppleScript(script);
}

/**
 * Open an application by name
 */
export async function openApp(appName: string): Promise<void> {
  if (!appName || appName.trim().length === 0) {
    throw new Error("App name cannot be empty");
  }

  // Use 'open -a' command (safer than AppleScript)
  try {
    await execAsync(`open -a "${appName}"`);
  } catch (error: any) {
    throw new Error(`Failed to open app "${appName}": ${error.message}`);
  }
}

/**
 * Focus (activate) an application
 */
export async function focusApp(appName: string): Promise<void> {
  if (!appName || appName.trim().length === 0) {
    throw new Error("App name cannot be empty");
  }

  const script = `
    tell application "${appName}"
      activate
    end tell
  `;
  await runAppleScript(script);
}

/**
 * Select a menu item in an application
 * menuPath example: ["File", "Export", "PNG"]
 */
export async function selectMenu(appName: string, menuPath: string[]): Promise<void> {
  if (!appName || menuPath.length === 0) {
    throw new Error("App name and menu path are required");
  }

  // Build nested menu click script
  let menuScript = `tell application "System Events" to tell process "${appName}"\n`;
  menuScript += `  click menu bar item "${menuPath[0]}" of menu bar 1\n`;

  for (let i = 1; i < menuPath.length; i++) {
    const isLast = i === menuPath.length - 1;
    if (isLast) {
      menuScript += `  click menu item "${menuPath[i]}" of menu "${menuPath[i - 1]}" of menu bar item "${menuPath[0]}" of menu bar 1\n`;
    } else {
      // Nested menus
      menuScript += `  -- Navigate to "${menuPath[i]}"\n`;
    }
  }

  menuScript += `end tell`;

  await runAppleScript(menuScript);
}

/**
 * Get the frontmost (active) application name
 */
export async function frontmostApp(): Promise<string> {
  const script = `
    tell application "System Events"
      set frontApp to name of first application process whose frontmost is true
      return frontApp
    end tell
  `;
  
  const appName = await runAppleScript(script);
  return appName;
}

/**
 * Get current screen resolution
 */
export async function getScreenResolution(): Promise<{ width: number; height: number }> {
  const script = `
    tell application "Finder"
      set screenSize to bounds of window of desktop
      set screenWidth to item 3 of screenSize
      set screenHeight to item 4 of screenSize
      return screenWidth & "x" & screenHeight
    end tell
  `;
  
  const result = await runAppleScript(script);
  const [width, height] = result.split("x").map(Number);
  return { width, height };
}
