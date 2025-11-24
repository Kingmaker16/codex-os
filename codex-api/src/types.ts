// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Platform = 
  | "tiktok" 
  | "youtube" 
  | "instagram" 
  | "gmail" 
  | "aws_s3" 
  | "google_cloud";

export type ContentType = "video" | "image" | "text" | "email";

export interface UploadRequest {
  sessionId: string;
  platform: Platform;
  contentType: ContentType;
  title?: string;
  description?: string;
  tags?: string[];
  fileUrl?: string;
  fileData?: string; // base64
  metadata?: Record<string, any>;
  accountId?: string;
}

export interface UploadResponse {
  ok: boolean;
  sessionId: string;
  platform: Platform;
  uploadId?: string;
  url?: string;
  status: "success" | "pending" | "failed";
  message?: string;
  error?: string;
}

export interface AuthRequest {
  sessionId: string;
  platform: Platform;
  accountId?: string;
  redirectUrl?: string;
  code?: string; // OAuth code
  refreshToken?: string;
}

export interface AuthResponse {
  ok: boolean;
  sessionId: string;
  platform: Platform;
  authUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  status: "pending" | "authenticated" | "failed";
  message?: string;
}

export interface Credential {
  platform: Platform;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface PlatformHealth {
  platform: Platform;
  status: "healthy" | "degraded" | "down";
  latency?: number;
  rateLimit?: {
    remaining: number;
    resetAt: number;
  };
  lastCheck: number;
}

export interface RateLimitConfig {
  platform: Platform;
  maxRequests: number;
  windowMs: number;
}

export interface TokenInfo {
  platform: Platform;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  isValid: boolean;
}
