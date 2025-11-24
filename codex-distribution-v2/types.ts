export type Platform = "tiktok" | "youtube" | "instagram" | "twitter" | "linkedin";
export type ContentType = "video" | "short" | "post" | "story" | "reel";
export type Language = "en" | "es" | "ar";
export type SafetyMode = "SEMI_AUTONOMOUS" | "FULL_AUTONOMOUS" | "MANUAL";
export type SlotStatus = "PLANNED" | "QUEUED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "SKIPPED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Account {
  id: string;
  platform: Platform;
  username: string;
  riskScore: number;
  lastUsed?: number;
  status: "ACTIVE" | "COOLDOWN" | "SUSPENDED" | "BANNED";
  metrics?: {
    totalPosts: number;
    successRate: number;
    avgEngagement: number;
  };
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  filePath?: string;
  thumbnail?: string;
  duration?: number;
  language: Language;
  metadata?: Record<string, any>;
  visibilityScore?: number;
  trendScore?: number;
}

export interface DistributionSlot {
  id: string;
  platform: Platform;
  datetime: string;
  accountId: string;
  contentId?: string;
  contentType: ContentType;
  repurposedFrom?: string;
  language: Language;
  status: SlotStatus;
  trendScore?: number;
  visibilityScore?: number;
  riskScore?: number;
  publishedAt?: string;
  error?: string;
}

export interface Calendar {
  id: string;
  weekStart: string;
  weekEnd: string;
  slots: DistributionSlot[];
  metadata?: {
    totalSlots: number;
    platforms: Platform[];
    languages: Language[];
  };
}

export interface DistributionPlan {
  id: string;
  contentId: string;
  platforms: Platform[];
  languages: Language[];
  velocity: number;
  trendWeighted: boolean;
  safetyMode: SafetyMode;
  slots: DistributionSlot[];
  createdAt: string;
  status: "DRAFT" | "APPROVED" | "EXECUTING" | "COMPLETED" | "FAILED";
}

export interface LLMSuggestion {
  provider: string;
  model: string;
  suggestions: {
    platform: Platform;
    timing: string;
    rationale: string;
    confidence: number;
  }[];
}

export interface TrendData {
  platform: Platform;
  trending: string[];
  peakHours: number[];
  score: number;
}

export interface VelocityProfile {
  platform: Platform;
  optimalPostsPerDay: number;
  minGapHours: number;
  peakHours: number[];
  engagementMultiplier: Record<number, number>;
}

export interface RepurposeRequest {
  contentId: string;
  sourcePlatform: Platform;
  targetPlatforms: Platform[];
  language?: Language;
}

export interface PublishRequest {
  slotId: string;
  accountId: string;
  contentId: string;
  platform: Platform;
  safetyMode: SafetyMode;
  simulate?: boolean;
}

export interface PublishResult {
  slotId: string;
  success: boolean;
  publishedUrl?: string;
  error?: string;
  timestamp: string;
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
  };
}

export interface DistributionState {
  activePlans: Map<string, DistributionPlan>;
  calendars: Map<string, Calendar>;
  publishQueue: DistributionSlot[];
  failedSlots: DistributionSlot[];
  metrics: {
    totalPublished: number;
    successRate: number;
    avgVisibilityScore: number;
  };
}
