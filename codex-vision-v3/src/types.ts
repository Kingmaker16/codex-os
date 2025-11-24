export type VisionPlatform = "premiere" | "finalcut" | "photoshop" | "browser" | "social_dashboard";

export interface FrameContext {
  frameId: string;
  timestamp: number;
  platform: VisionPlatform;
  screenshotPath: string;  // local or URL
  meta?: any;
}

export interface UIElement {
  id: string;
  type: "BUTTON" | "TIMELINE" | "PANEL" | "MENU" | "TEXT" | "ICON" | "DIALOG" | "OTHER";
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface UIState {
  frameId: string;
  platform: VisionPlatform;
  elements: UIElement[];
  inferredMode?: string;
}

export interface EditAction {
  id: string;
  type: "TRIM" | "CUT" | "SPEED_RAMP" | "COLOR_ADJUST" | "TEXT_OVERLAY" | "ZOOM" | "MOVE_CLIP" | "SELECT_TOOL" | "CLICK" | "DRAG";
  description: string;
  targetElementId?: string;
  params?: any;
}

export interface VisionV3Suggestion {
  requiresApproval: true;
  frameSequence: string[];
  uiStates: UIState[];
  actionsProposed: EditAction[];
  rationale: string;
}
