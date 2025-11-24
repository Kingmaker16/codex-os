/**
 * Hands v4.5 — Caption Overlay
 * 
 * Apply captions/subtitles as text overlays in video editors
 */

import * as macosActions from "../native/macosActions.js";

export interface CaptionSegment {
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Add captions to a video project
 */
export async function addCaptions(
  app: "capcut" | "finalcut",
  captions: CaptionSegment[]
): Promise<{ ok: boolean; error?: string }> {
  console.log(`[CaptionOverlay] Adding ${captions.length} captions to ${app}`);

  try {
    for (const caption of captions) {
      await addSingleCaption(app, caption);
    }

    return { ok: true };
  } catch (error: any) {
    console.error(`[CaptionOverlay] Failed to add captions:`, error);
    return { ok: false, error: error.message };
  }
}

/**
 * Add a single caption segment
 */
async function addSingleCaption(app: "capcut" | "finalcut", caption: CaptionSegment): Promise<void> {
  console.log(`[CaptionOverlay] Adding caption at ${caption.startMs}ms: "${caption.text}"`);

  if (app === "finalcut") {
    await addFinalCutCaption(caption);
  } else if (app === "capcut") {
    await addCapCutCaption(caption);
  }
}

/**
 * Add caption in Final Cut Pro
 */
async function addFinalCutCaption(caption: CaptionSegment): Promise<void> {
  // TODO: Implement Final Cut Pro caption workflow
  // Approach:
  // 1. Move playhead to startMs (approximate)
  // 2. Create new text layer: Edit → Connect Title → Basic Title
  // 3. Type caption text
  // 4. Adjust duration to match endMs - startMs
  
  console.log(`[CaptionOverlay] FCP caption workflow:`);
  console.log(`  - Position playhead at ~${caption.startMs}ms`);
  console.log(`  - Create title layer`);
  console.log(`  - Set text: "${caption.text}"`);
  console.log(`  - Duration: ${caption.endMs - caption.startMs}ms`);

  // Step 1: Move playhead (TODO: precise positioning)
  // For now, approximate with arrow keys or direct positioning

  // Step 2: Add title
  await macosActions.selectMenu("Final Cut Pro", ["Edit", "Connect Title", "Basic Title"]);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 3: Type text
  await macosActions.typeText(caption.text);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 4: Adjust duration (TODO: trim to exact length)
  // For now, leave at default duration
  console.log(`[CaptionOverlay] FCP caption added (duration adjustment TODO)`);
}

/**
 * Add caption in CapCut
 */
async function addCapCutCaption(caption: CaptionSegment): Promise<void> {
  // TODO: Implement CapCut caption workflow
  // CapCut has built-in auto-caption and text overlay features
  // Approach:
  // 1. Click "Text" button in toolbar
  // 2. Select "Add text" or "Caption"
  // 3. Position on timeline at startMs
  // 4. Type caption text
  // 5. Adjust duration
  
  console.log(`[CaptionOverlay] CapCut caption workflow:`);
  console.log(`  - Click Text button (TODO: coordinates)`);
  console.log(`  - Add text at ${caption.startMs}ms`);
  console.log(`  - Set text: "${caption.text}"`);
  console.log(`  - Duration: ${caption.endMs - caption.startMs}ms`);

  // Step 1: Click Text button (TODO: find exact coordinates)
  // For now, stub with menu navigation if available
  console.log(`[CaptionOverlay] CapCut caption stub - manual implementation needed`);

  // Step 2-5: Manual steps for now
  // TODO: Implement precise UI automation once coordinates are mapped
}

/**
 * Helper: Convert milliseconds to timecode format
 */
function msToTimecode(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const s = seconds % 60;
  const m = minutes % 60;
  const frames = Math.floor((ms % 1000) / (1000 / 30)); // Assume 30fps

  return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

/**
 * Helper: Position playhead at specific time
 * TODO: Implement precise playhead positioning
 */
async function positionPlayhead(app: "capcut" | "finalcut", timeMs: number): Promise<void> {
  console.log(`[CaptionOverlay] Positioning playhead at ${timeMs}ms (${msToTimecode(timeMs)})`);
  
  // TODO: Implement precise positioning
  // Options:
  // 1. Type timecode directly (if editor supports)
  // 2. Use frame-by-frame navigation (arrow keys)
  // 3. Click on timeline at calculated position
  
  console.log(`[CaptionOverlay] Playhead positioning stub - needs precise implementation`);
}
