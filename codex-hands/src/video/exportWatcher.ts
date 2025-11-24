/**
 * Hands v4.5 — Export Watcher
 * 
 * Watch for video export completion by monitoring file system
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Wait for export completion by polling directory for new files
 */
export async function waitForExportCompletion(
  expectedDir: string,
  timeoutMs: number = 300000 // 5 minutes default
): Promise<{ ok: boolean; filePath?: string }> {
  console.log(`[ExportWatcher] Watching ${expectedDir} for export completion (timeout: ${timeoutMs}ms)`);

  const startTime = Date.now();
  const pollInterval = 2000; // Check every 2 seconds
  
  // Get initial file list
  let initialFiles: string[];
  try {
    initialFiles = await fs.readdir(expectedDir);
  } catch (error) {
    console.error(`[ExportWatcher] Failed to read directory:`, error);
    return { ok: false };
  }

  // Poll for new video files
  while (Date.now() - startTime < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const currentFiles = await fs.readdir(expectedDir);
      
      // Find new video files
      const newFiles = currentFiles.filter(f => !initialFiles.includes(f));
      const videoFiles = newFiles.filter(f => isVideoFile(f));

      if (videoFiles.length > 0) {
        // Found new video file(s)
        const filePath = path.join(expectedDir, videoFiles[0]);
        
        // Verify file is complete (not still being written)
        if (await isFileComplete(filePath)) {
          console.log(`[ExportWatcher] Export complete: ${filePath}`);
          return { ok: true, filePath };
        } else {
          console.log(`[ExportWatcher] File still being written: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`[ExportWatcher] Polling error:`, error);
    }
  }

  console.warn(`[ExportWatcher] Timeout waiting for export completion`);
  return { ok: false };
}

/**
 * Check if a file is a video file based on extension
 */
function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.mts'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

/**
 * Check if a file is complete (not still being written)
 * by comparing file size at two intervals
 */
async function isFileComplete(filePath: string, delayMs: number = 3000): Promise<boolean> {
  try {
    const stats1 = await fs.stat(filePath);
    const size1 = stats1.size;

    // Wait and check again
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const stats2 = await fs.stat(filePath);
    const size2 = stats2.size;

    // If size hasn't changed, file is likely complete
    return size1 === size2 && size1 > 0;
  } catch (error) {
    console.error(`[ExportWatcher] Failed to check file completion:`, error);
    return false;
  }
}

/**
 * Get most recent video file in directory
 */
export async function getMostRecentVideoFile(dir: string): Promise<string | null> {
  try {
    const files = await fs.readdir(dir);
    const videoFiles = files.filter(f => isVideoFile(f));

    if (videoFiles.length === 0) {
      return null;
    }

    // Get stats for all video files
    const fileStats = await Promise.all(
      videoFiles.map(async (f) => {
        const filePath = path.join(dir, f);
        const stats = await fs.stat(filePath);
        return { filePath, mtime: stats.mtime };
      })
    );

    // Sort by modification time (most recent first)
    fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return fileStats[0].filePath;
  } catch (error) {
    console.error(`[ExportWatcher] Failed to get most recent video:`, error);
    return null;
  }
}
