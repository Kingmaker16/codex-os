import { FrameContext, UIElement, UIState, VisionPlatform } from "./types.js";
import { v4 as uuid } from "uuid";

// Stub: simple fake element detection; can be wired to real vision model later.
export async function analyzeFrameToUIState(frame: FrameContext): Promise<UIState> {
  const base: UIElement[] = [];

  if (frame.platform === "premiere") {
    base.push({
      id: uuid(),
      type: "TIMELINE",
      label: "Timeline",
      x: 0,
      y: 600,
      width: 1920,
      height: 480,
      confidence: 0.9
    });
  }

  return {
    frameId: frame.frameId,
    platform: frame.platform,
    elements: base,
    inferredMode: "EDITING"
  };
}
