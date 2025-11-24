import { EditAction, UIState } from "./types.js";
import { v4 as uuid } from "uuid";

export async function suggestEdits(uiStates: UIState[]): Promise<EditAction[]> {
  const actions: EditAction[] = [];

  for (const state of uiStates) {
    const timeline = state.elements.find(e => e.type === "TIMELINE");
    if (timeline) {
      actions.push({
        id: uuid(),
        type: "TRIM",
        description: "Trim start of clip by ~0.5s to tighten hook.",
        targetElementId: timeline.id,
        params: { trimMs: 500 }
      });
      actions.push({
        id: uuid(),
        type: "ZOOM",
        description: "Add subtle zoom-in on subject during first 3 seconds.",
        targetElementId: timeline.id,
        params: { zoomFactor: 1.08, durationMs: 3000 }
      });
    }
  }

  return actions;
}
