// Vision Engine v2.6 ULTRA - Type Definitions

export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  resolution: { width: number; height: number };
  visualComplexity: number; // 0-1
  motionIntensity: number; // 0-1
  faceDetections: FaceDetection[];
  textOverlays: TextOverlay[];
  dominantColors: string[];
  brightness: number; // 0-1
  contrast: number; // 0-1
  saturation: number; // 0-1
  isHookFrame: boolean; // First 3 seconds
  isDeadFrame: boolean; // Low motion/interest
  recommendations: string[];
}

export interface FaceDetection {
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
  emotion?: "neutral" | "happy" | "surprised" | "focused";
  isCentered: boolean;
}

export interface TextOverlay {
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
  isReadable: boolean;
}

export interface TimelineAnalysis {
  videoPath: string;
  duration: number;
  frameRate: number;
  resolution: { width: number; height: number };
  totalFrames: number;
  analyzedFrames: FrameAnalysis[];
  hookWindow: { start: number; end: number; quality: "excellent" | "good" | "poor" };
  pacingAnalysis: PacingAnalysis;
  deadFrames: number[];
  colorGradingIssues: ColorIssue[];
  audioSyncIssues?: number[];
}

export interface PacingAnalysis {
  platform: string;
  idealCutFrequency: number; // cuts per second
  actualCutFrequency: number;
  cutTimestamps: number[];
  retentionScore: number; // 0-100
  recommendations: string[];
}

export interface ColorIssue {
  timestamp: number;
  issue: "underexposed" | "overexposed" | "low_saturation" | "color_cast";
  severity: "low" | "medium" | "high";
  suggestion: string;
}

export interface EditAction {
  id: string;
  type:
    | "trim"
    | "cut"
    | "jump_zoom"
    | "crop"
    | "contrast"
    | "color_lift"
    | "saturation_bump"
    | "speed_ramp"
    | "text_overlay"
    | "zoom_to_face";
  timestamp: number;
  duration?: number;
  parameters: Record<string, any>;
  reason: string;
  confidence: number; // 0-1
  priority: "low" | "medium" | "high" | "critical";
}

export interface EditSuggestion {
  videoPath: string;
  platform: string;
  actions: EditAction[];
  requiresApproval: boolean; // Co-Pilot mode: always true
  estimatedImpact: {
    retentionIncrease: number; // percentage
    engagementIncrease: number; // percentage
    viralPotential: number; // 0-100
  };
  llmResponses: LLMResponse[];
  consensusScore: number; // 0-100
  generatedAt: string;
}

export interface LLMResponse {
  provider: "openai" | "anthropic" | "google" | "xai";
  model: string;
  suggestions: any;
  latency: number;
  timestamp: string;
}

export interface TimelineMap {
  editor: "premiere" | "finalcut" | "capcut";
  videoPath: string;
  tracks: Track[];
  markers: Marker[];
  exportScript?: string;
}

export interface Track {
  id: string;
  type: "video" | "audio" | "text";
  clips: Clip[];
}

export interface Clip {
  id: string;
  start: number;
  end: number;
  source?: string;
  effects?: Effect[];
}

export interface Effect {
  type: string;
  parameters: Record<string, any>;
}

export interface Marker {
  timestamp: number;
  label: string;
  color?: string;
  note?: string;
}

export interface ARFeedback {
  sessionId: string;
  frameNumber: number;
  suggestions: string[];
  overlays: AROverlay[];
  realtime: boolean;
}

export interface AROverlay {
  type: "bounding_box" | "text" | "arrow" | "highlight";
  position: { x: number; y: number; width?: number; height?: number };
  content: string;
  color: string;
}

export interface PerformanceLog {
  editId: string;
  videoPath: string;
  platform: string;
  appliedActions: EditAction[];
  metrics: {
    views: number;
    engagement: number;
    ctr: number;
    completionRate: number;
    avgWatchTime: number;
  };
  timestamp: string;
}

export interface VisionRequest {
  videoPath?: string;
  frameData?: string; // base64
  frameNumber?: number;
  timestamp?: number;
  platform: string;
  mode?: "analysis" | "suggestion" | "copilot";
}
