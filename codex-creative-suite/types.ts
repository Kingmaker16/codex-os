// =============================================
// CREATIVE SUITE v1.5 ULTRA — TYPE DEFINITIONS
// =============================================

export interface CreativeRequest {
  sessionId: string;
  niche: string;
  platform: "tiktok" | "youtube" | "instagram" | "all";
  contentType: "short-form" | "long-form" | "ugc-ad" | "carousel";
  productName?: string;
  targetAudience?: string;
  goals?: string[];
  videoPath?: string;
  rawFootage?: string[];
}

export interface CreativePlan {
  id: string;
  sessionId: string;
  strategy: string;
  hooks: HookSuggestion[];
  pacing: PacingPlan;
  scenes: SceneAnalysis[];
  captions: CaptionPlan;
  thumbnail: ThumbnailPlan;
  audio: AudioPlan;
  brandVoice: BrandVoiceCheck;
  trendAlignment: TrendAlignment;
  estimatedPerformance: PerformanceEstimate;
  createdAt: string;
}

export interface HookSuggestion {
  id: string;
  text: string;
  type: "question" | "statement" | "challenge" | "curiosity" | "emotion";
  strength: number; // 0-100
  platform: string[];
  source: "gpt4" | "claude" | "gemini" | "grok" | "fusion";
}

export interface PacingPlan {
  totalDuration: number; // seconds
  segments: PacingSegment[];
  viralScore: number; // 0-100
}

export interface PacingSegment {
  startTime: number;
  endTime: number;
  type: "hook" | "buildup" | "climax" | "cta" | "outro";
  intensity: number; // 0-10
  emotionalBeat: string;
}

export interface SceneAnalysis {
  sceneId: string;
  startTime: number;
  endTime: number;
  shotType: "closeup" | "medium" | "wide" | "product" | "action";
  visualElements: string[];
  audioElements: string[];
  recommendedEdits: string[];
}

export interface CaptionPlan {
  captions: Caption[];
  style: "minimal" | "full" | "keywords" | "custom";
  platform: string;
}

export interface Caption {
  startTime: number;
  endTime: number;
  text: string;
  position: "top" | "center" | "bottom";
  style: CaptionStyle;
}

export interface CaptionStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  animation?: "fade" | "slide" | "bounce" | "none";
}

export interface ThumbnailPlan {
  id: string;
  keyFrame: number; // timestamp for best frame
  elements: ThumbnailElement[];
  textOverlay: string;
  colorScheme: string[];
  clickabilityScore: number; // 0-100
}

export interface ThumbnailElement {
  type: "face" | "product" | "text" | "emoji" | "arrow";
  position: { x: number; y: number };
  size: { width: number; height: number };
  content?: string;
}

export interface AudioPlan {
  loudness: number; // LUFS
  normalizationApplied: boolean;
  noiseReduction: boolean;
  musicTrack?: string;
  voiceoverTiming?: VoiceoverSegment[];
}

export interface VoiceoverSegment {
  startTime: number;
  endTime: number;
  text: string;
  voice: "amar" | "narrator" | "character";
}

export interface BrandVoiceCheck {
  compliant: boolean;
  score: number; // 0-100
  violations: string[];
  suggestions: string[];
  tone: "authentic" | "educational" | "entertaining" | "sales";
}

export interface TrendAlignment {
  aligned: boolean;
  trendScore: number; // 0-100
  trendingElements: string[];
  missedOpportunities: string[];
  recommendations: string[];
}

export interface PerformanceEstimate {
  viewsEstimate: { min: number; max: number };
  engagementRate: number; // 0-100
  conversionProbability: number; // 0-100
  viralPotential: "low" | "medium" | "high" | "extreme";
  confidence: number; // 0-100
}

export interface VideoAnalysisRequest {
  videoPath: string;
  analyzeScenes?: boolean;
  detectShots?: boolean;
  generateThumbnails?: boolean;
  extractAudio?: boolean;
}

export interface VideoAnalysisResult {
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
  scenes: SceneAnalysis[];
  shots: number;
  audioQuality: number; // 0-100
  thumbnailCandidates: number[];
}
