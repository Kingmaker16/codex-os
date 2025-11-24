export interface VideoGenRequest {
  sessionId: string;
  script: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  style?: string;
  voice?: string;
  duration?: number;
}

export interface VideoEditRequest {
  sessionId: string;
  operations: Array<{
    type: "trim" | "caption" | "audio" | "overlay";
    params: any;
  }>;
  inputPath: string;
}

export interface VideoFusionResult {
  fusedVideoPath: string;
  confidence: number;
  engineBreakdown: Record<string, any>;
  templateId?: string;
  engineUsed?: string;
}

export interface UGCRequest {
  sessionId: string;
  templateId?: string;
  productName?: string;
  brandTone?: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  durationSec?: number;
}

export interface VideoAdsRequest {
  sessionId: string;
  productName: string;
  offer?: string;
  angle?: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  count?: number;
}
