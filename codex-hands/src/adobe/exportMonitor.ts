/**
 * Hands v4.6 — Adobe Export Monitor
 * 
 * Monitors Adobe export dialogs and detects completion
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { analyzeScreenWithVision } from "../uiVision.js";

export interface ExportMonitorOptions {
  app: "premiere" | "photoshop";
  outputDir: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export interface ExportResult {
  ok: boolean;
  filePath?: string;
  error?: string;
  timedOut?: boolean;
}

/**
 * Monitor export progress and detect completion
 */
export async function monitorExport(options: ExportMonitorOptions): Promise<ExportResult> {
  const timeout = options.timeoutMs || 300000; // 5 minutes default
  const pollInterval = options.pollIntervalMs || 3000; // 3 seconds default
  const startTime = Date.now();
  
  console.log(`[Export Monitor] Watching ${options.outputDir} for ${options.app} export (timeout: ${timeout}ms)`);
  
  try {
    // Get initial file list
    const initialFiles = await listFiles(options.outputDir);
    
    // Poll for new files or completion
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check for new files
      const currentFiles = await listFiles(options.outputDir);
      const newFiles = currentFiles.filter(f => !initialFiles.includes(f));
      
      if (newFiles.length > 0) {
        // Found new file(s) - verify it's complete
        const mostRecent = getMostRecentFile(options.outputDir, newFiles);
        
        if (await isFileComplete(mostRecent, 2000)) {
          console.log(`[Export Monitor] Export completed: ${mostRecent}`);
          return {
            ok: true,
            filePath: mostRecent,
          };
        }
      }
      
      // Check export dialog with Vision (optional)
      if (options.app === "premiere") {
        const dialogStatus = await detectPremiereExportDialog();
        if (dialogStatus.completed) {
          // Dialog shows completion
          const exportedFile = await findMostRecentExport(options.outputDir);
          return {
            ok: true,
            filePath: exportedFile,
          };
        }
      }
    }
    
    // Timeout reached
    console.warn(`[Export Monitor] Export timed out after ${timeout}ms`);
    return {
      ok: false,
      timedOut: true,
      error: `Export did not complete within ${timeout}ms`,
    };
    
  } catch (error: any) {
    console.error(`[Export Monitor] Error:`, error);
    return {
      ok: false,
      error: error.message,
    };
  }
}

/**
 * List all files in directory
 */
async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile())
      .map(e => path.join(dir, e.name));
  } catch (error) {
    return [];
  }
}

/**
 * Get most recent file from list
 */
function getMostRecentFile(dir: string, files: string[]): string {
  // Sort by modification time (newest first)
  // For now, just return first file
  return files[0];
}

/**
 * Check if file is complete (not still being written)
 */
async function isFileComplete(filePath: string, delayMs: number = 2000): Promise<boolean> {
  try {
    const stat1 = await fs.stat(filePath);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    const stat2 = await fs.stat(filePath);
    
    // File is complete if size hasn't changed
    return stat1.size === stat2.size && stat2.size > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Detect Premiere export dialog status with Vision
 */
async function detectPremiereExportDialog(): Promise<{ completed: boolean; progress?: number }> {
  try {
    const result = await analyzeScreenWithVision(
      "Check if Adobe Premiere Pro export dialog is visible. Is it showing 'Export Complete' or a progress bar? Return status."
    );
    
    // Parse Vision response
    // TODO: Extract completion status and progress percentage
    
    return { completed: false, progress: 0 };
  } catch (error) {
    return { completed: false };
  }
}

/**
 * Find most recently exported file in directory
 */
async function findMostRecentExport(dir: string): Promise<string> {
  try {
    const files = await fs.readdir(dir);
    
    // Filter for video/image files
    const mediaFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return [".mp4", ".mov", ".avi", ".png", ".jpg", ".jpeg", ".psd", ".tiff"].includes(ext);
    });
    
    if (mediaFiles.length === 0) {
      return path.join(dir, "export_unknown");
    }
    
    // Get stats and sort by mtime
    const filesWithStats = await Promise.all(
      mediaFiles.map(async f => {
        const fullPath = path.join(dir, f);
        const stat = await fs.stat(fullPath);
        return { path: fullPath, mtime: stat.mtime };
      })
    );
    
    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    return filesWithStats[0].path;
  } catch (error) {
    return path.join(dir, "export_error");
  }
}

/**
 * Monitor Premiere export specifically
 */
export async function monitorPremiereExport(outputDir: string, timeoutMs: number = 600000): Promise<ExportResult> {
  return monitorExport({
    app: "premiere",
    outputDir,
    timeoutMs,
    pollIntervalMs: 5000, // Premiere exports are longer
  });
}

/**
 * Monitor Photoshop export specifically
 */
export async function monitorPhotoshopExport(outputDir: string, timeoutMs: number = 120000): Promise<ExportResult> {
  return monitorExport({
    app: "photoshop",
    outputDir,
    timeoutMs,
    pollIntervalMs: 2000, // Photoshop exports are faster
  });
}
