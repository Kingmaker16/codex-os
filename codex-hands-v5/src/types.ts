// =============================================
// HANDS v5.0 ULTRA — TYPE DEFINITIONS
// =============================================

export const SEMI_AUTONOMOUS_MODE = true;
export const SAFE_ROOT = "/Users/amar/Codex";

// Core Action Types
export type ActionType = 
  | "click" | "type" | "drag" | "scroll" | "wait"
  | "openApp" | "closeApp" | "runScript" | "executeShell"
  | "uploadFile" | "downloadFile" | "screenshot"
  | "videoEdit" | "videoExport" | "socialPost" | "socialComment"
  | "listProduct" | "fulfillOrder" | "priceTest";

export type NodeType = "ACTION" | "LOOP" | "CONDITIONAL";

export interface ActionNode {
  id: string;
  type: NodeType;
  actionType?: ActionType;
  params: Record<string, any>;
  dependsOn?: string[];
  retryCount?: number;
  maxRetries?: number;
  status?: "pending" | "running" | "success" | "failed" | "skipped";
  result?: any;
  error?: string;
}

export interface ExecutionChain {
  id: string;
  name: string;
  nodes: ActionNode[];
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Creative Module Types
export interface VideoEditRequest {
  sessionId: string;
  videoPath: string;
  template?: string;
  operations: VideoOperation[];
  exportFormat?: "tiktok" | "reels" | "youtube" | "custom";
}

export interface VideoOperation {
  type: "cut" | "trim" | "colorGrade" | "addText" | "addMusic" | "transition";
  params: Record<string, any>;
  timestamp?: number;
}

// Social Module Types
export interface SocialPostRequest {
  sessionId: string;
  platform: "tiktok" | "youtube" | "instagram" | "twitter";
  accountId: string;
  content: {
    caption?: string;
    videoPath?: string;
    imagePath?: string;
    hashtags?: string[];
  };
  schedule?: string;
  verify?: boolean;
}

export interface EngagementMacro {
  id: string;
  type: "comment" | "like" | "follow" | "reply";
  target: string;
  message?: string;
  count?: number;
}

// Store Module Types
export interface ProductListingRequest {
  sessionId: string;
  platform: "shopify" | "amazon" | "etsy" | "custom";
  product: {
    title: string;
    description: string;
    price: number;
    images: string[];
    variants?: ProductVariant[];
  };
  autoPublish?: boolean;
}

export interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  inventory: number;
}

export interface FulfillmentRequest {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  notify?: boolean;
}

// Vision Integration Types
export interface VisionCheckpoint {
  screenAnalysis: any;
  uiMap: any;
  suggestedActions: any[];
  aligned: boolean;
}

// Safety Types
export interface RiskAssessment {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  violations: string[];
  allowed: boolean;
}

export interface SafetyConfig {
  domainWhitelist: string[];
  appWhitelist: string[];
  forbiddenActions: ActionType[];
  maxRetries: number;
}
