// Content Routing Engine v2 ULTRA - Type Definitions

export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'twitter' | 'linkedin';
export type ContentType = 'short' | 'long' | 'post' | 'story' | 'reel';
export type Language = 'en' | 'es' | 'ar';
export type RouteStatus = 'ANALYZING' | 'SCORED' | 'OPTIMIZED' | 'RECOMMENDED' | 'SELECTED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Content {
  id: string;
  type: ContentType;
  duration?: number;
  language: Language;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RouteOption {
  platform: Platform;
  score: number;
  trendScore: number;
  visibilityScore: number;
  riskScore: number;
  velocityScore: number;
  confidence: number;
  reasoning: string;
  accountId?: string;
  scheduledTime?: string;
}

export interface RoutingRequest {
  contentId: string;
  content: Content;
  targetPlatforms?: Platform[];
  languages?: Language[];
  maxRisk?: RiskLevel;
  trendWeighted?: boolean;
  accountPreference?: string[];
}

export interface RoutingResponse {
  routeId: string;
  contentId: string;
  routes: RouteOption[];
  topRoute: RouteOption;
  alternatives: RouteOption[];
  llmConsensus: LLMConsensus;
  timestamp: string;
  status: RouteStatus;
}

export interface LLMSuggestion {
  provider: 'gpt4o' | 'claude' | 'gemini' | 'grok';
  platform: Platform;
  confidence: number;
  reasoning: string;
  timing?: string;
  riskAssessment?: string;
}

export interface LLMConsensus {
  topChoice: Platform;
  confidence: number;
  suggestions: LLMSuggestion[];
  agreement: number; // 0-1 (1 = all LLMs agree)
  divergence: string[];
}

export interface ScoreWeights {
  trend: number;
  visibility: number;
  risk: number;
  velocity: number;
}

export interface OptimizationOptions {
  maxRoutes?: number;
  minScore?: number;
  diversifyPlatforms?: boolean;
  prioritizeSafety?: boolean;
  trendBoost?: number;
}

export interface SimulationResult {
  routeId: string;
  route: RouteOption;
  predictedReach: number;
  predictedEngagement: number;
  predictedRisk: number;
  estimatedRevenue: number;
  successProbability: number;
  warnings: string[];
  recommendations: string[];
}

export interface RouteState {
  routeId: string;
  contentId: string;
  routes: RouteOption[];
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}
