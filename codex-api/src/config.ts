// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { RateLimitConfig } from "./types.js";

export const PORT = process.env.PORT || 5150;
export const VERSION = "1.0.0";

// Encryption key for credential vault (in production, use env var)
export const VAULT_KEY = process.env.VAULT_KEY || "codex-api-vault-key-change-in-production";

// Rate limit configurations per platform
export const RATE_LIMITS: RateLimitConfig[] = [
  { platform: "tiktok", maxRequests: 100, windowMs: 60000 }, // 100 req/min
  { platform: "youtube", maxRequests: 10000, windowMs: 86400000 }, // 10k req/day
  { platform: "instagram", maxRequests: 200, windowMs: 3600000 }, // 200 req/hour
  { platform: "gmail", maxRequests: 250, windowMs: 1000 }, // 250 req/sec
  { platform: "aws_s3", maxRequests: 3500, windowMs: 1000 }, // 3500 req/sec
  { platform: "google_cloud", maxRequests: 10000, windowMs: 60000 }, // 10k req/min
];

// OAuth redirect URLs
export const OAUTH_REDIRECT_BASE = process.env.OAUTH_REDIRECT_BASE || "http://localhost:5150/api/auth/callback";

// Platform API endpoints
export const PLATFORM_ENDPOINTS = {
  tiktok: "https://open.tiktokapis.com/v2",
  youtube: "https://www.googleapis.com/youtube/v3",
  instagram: "https://graph.facebook.com/v18.0",
  gmail: "https://gmail.googleapis.com/gmail/v1",
  aws_s3: process.env.AWS_S3_ENDPOINT || "https://s3.amazonaws.com",
  google_cloud: "https://storage.googleapis.com/storage/v1",
};

// OAuth client credentials (in production, use env vars)
export const OAUTH_CLIENTS = {
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
  },
};

// AWS credentials
export const AWS_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  bucket: process.env.AWS_S3_BUCKET || "codex-uploads",
};

// Google Cloud credentials
export const GCP_CONFIG = {
  projectId: process.env.GCP_PROJECT_ID || "",
  keyFilename: process.env.GCP_KEY_FILENAME || "",
  bucket: process.env.GCP_BUCKET || "codex-uploads",
};
