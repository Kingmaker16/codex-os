// Creative Suite Enhancement v1.5 ULTRA - Type Definitions

export interface CreativeRequest {
  videoPath: string;
  platform: "tiktok" | "reels" | "youtube" | "shorts";
  objective?: "viral" | "engagement" | "conversion" | "brand";
  targetAudience?: string;
  brandVoice?: "amar" | "professional" | "casual" | "energetic";
  trendAlign?: boolean;
}

export interface CreativePlan {
  videoPath: string;
  platform: string;
  hookSuggestions: string[];
  pacingPlan: PacingPlan;
  scriptSuggestions: string[];
  ctaSuggestions: string[];
  emotionalBeats: EmotionalBeat[];
  thumbnailConcepts: ThumbnailConcept[];
  captionPlan: CaptionPlan;
  audioPlan: AudioPlan;
  trendAlignment?: TrendAlignment;
  brandVoiceScore?: number;
  consensusScore?: number;
  llmResponses?: LLMResponse[];
}

export interface PacingPlan {
  totalDuration: number;
  segments: PacingSegment[];
  hookWindow: { start: number; end: number };
  peakMoment: number;
  ctaWindow: { start: number; end: number };
}

export interface PacingSegment {
  start: number;
  end: number;
  type: "hook" | "build" | "peak" | "resolve" | "cta";
  intensity: number; // 0-1
  cutFrequency?: number; // cuts per second
}

export interface EmotionalBeat {
  timestamp: number;
  emotion: "curiosity" | "excitement" | "surprise" | "inspiration" | "urgency";
  intensity: number; // 0-1
  trigger?: string;
}

export interface ThumbnailConcept {
  concept: string;
  elements: string[];
  colorScheme: string[];
  textOverlay?: string;
  faceExpression?: string;
  visualHook: string;
  estimatedCTR?: number;
}

export interface CaptionPlan {
  mainCaption: string;
  alternates: string[];
  hashtags: string[];
  timing: CaptionTiming[];
  hooks: string[];
}

export interface CaptionTiming {
  text: string;
  start: number;
  end: number;
  position: "top" | "center" | "bottom";
  style?: "bold" | "uppercase" | "animated";
}

export interface AudioPlan {
  musicSuggestions: string[];
  soundEffects: SoundEffect[];
  voiceoverTiming?: VoiceoverSegment[];
  loudnessTarget: number; // LUFS
  normalizationRequired: boolean;
}

export interface SoundEffect {
  type: string;
  timestamp: number;
  description: string;
}

export interface VoiceoverSegment {
  start: number;
  end: number;
  script: string;
  tone: string;
}

export interface TrendAlignment {
  matchedTrends: string[];
  trendScore: number; // 0-100
  suggestions: string[];
  hashtags: string[];
}

export interface LLMResponse {
  provider: "openai" | "anthropic" | "google" | "xai";
  model: string;
  response: any;
  latency: number;
  timestamp: string;
}

export interface SceneAnalysis {
  videoPath: string;
  duration: number;
  scenes: Scene[];
  visualComplexity: number; // 0-1
  motionIntensity: number; // 0-1
  colorDominance: Record<string, number>;
  faceDetections?: FaceDetection[];
  textDetections?: TextDetection[];
}

export interface Scene {
  start: number;
  end: number;
  type: "static" | "motion" | "transition";
  dominantColors: string[];
  complexity: number;
  keyFrameTimestamp?: number;
}

export interface FaceDetection {
  timestamp: number;
  count: number;
  expressions?: string[];
  dominantExpression?: string;
}

export interface TextDetection {
  timestamp: number;
  text: string;
  confidence: number;
}

export interface BrandVoiceCheck {
  originalText: string;
  score: number; // 0-100
  violations: BrandViolation[];
  suggestions: string[];
  alignedVersion?: string;
}

export interface BrandViolation {
  type: "tone" | "language" | "style" | "structure";
  severity: "low" | "medium" | "high";
  description: string;
  suggestion?: string;
}

export interface EnhancedVideoOutput {
  videoPath: string;
  enhancedPath: string;
  enhancements: Enhancement[];
  audioNormalized: boolean;
  colorCorrected: boolean;
  pacingOptimized: boolean;
  captionsAdded: boolean;
  processingTime: number;
}

export interface Enhancement {
  type: "audio" | "color" | "pacing" | "captions" | "effects";
  description: string;
  timestamp?: number;
  appliedAt: string;
}

export interface IntegrationPayload {
  targetService: "social" | "campaign" | "video" | "engagement" | "ecommerce";
  endpoint: string;
  payload: any;
  priority?: "low" | "normal" | "high";
}

export interface PerformanceMetrics {
  creativeId: string;
  platform: string;
  views: number;
  engagement: number;
  ctr: number;
  completionRate: number;
  conversions?: number;
  timestamp: string;
}

export interface LearningFeedback {
  creativeId: string;
  metrics: PerformanceMetrics;
  insights: string[];
  recommendations: string[];
  confidence: number;
}
