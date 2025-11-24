import { FrameContext, UIState } from "./types.js";

// Reason over a sequence of frames, e.g. before + after a click or edit.
export async function reasonOverFrames(frames: FrameContext[], uiStates: UIState[]): Promise<string> {
  if (frames.length === 0) return "No frames to analyze.";

  const platforms = new Set(frames.map(f => f.platform));
  const firstTs = frames[0].timestamp;
  const lastTs = frames[frames.length - 1].timestamp;

  return `Analyzed ${frames.length} frames over ${lastTs - firstTs}ms across platforms: ${Array.from(platforms).join(", ")}`;
}
