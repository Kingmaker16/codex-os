/**
 * Social Engine v1 - Type Definitions
 */

import type { Platform } from "./config.js";

export interface SocialAccount {
  id: string;
  platform: Platform;
  username?: string;
  email?: string;
  loginState: "pending" | "logged_in" | "logged_out" | "error";
  niche?: string;
  postingStyle?: string;
  proxy?: string;
  retentionToken?: string; // For session persistence
  createdAt: string;
  lastLogin?: string;
  metadata?: Record<string, any>;
}

export interface CreateAccountRequest {
  platform: Platform;
  email?: string;
  username?: string;
  niche?: string;
  postingStyle?: string;
  proxy?: string;
}

export interface LoginRequest {
  accountId: string;
  useCaptchaSolver?: boolean;
}

export interface PostRequest {
  accountId: string;
  platform: Platform;
  content: {
    text?: string;
    media?: string[]; // URLs or file paths
    title?: string;
    description?: string;
    tags?: string[];
  };
  scheduledFor?: string; // ISO 8601 timestamp
}

export interface ScheduledPost {
  id: string;
  accountId: string;
  platform: Platform;
  content: PostRequest["content"];
  scheduledFor: string;
  status: "pending" | "posted" | "failed";
  retries: number;
  createdAt: string;
  postedAt?: string;
  error?: string;
}

export interface AnalyticsData {
  accountId: string;
  platform: Platform;
  metrics: {
    followers?: number;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagement?: number;
  };
  timestamp: string;
}

export interface DashboardData {
  accountId: string;
  platform: Platform;
  isLoggedIn: boolean;
  username?: string;
  analytics?: AnalyticsData["metrics"];
  notifications?: number;
  timestamp: string;
}

// ──────────────────────────────────────────────────────────────
// Social Engine v1.5 - New Interfaces
// ──────────────────────────────────────────────────────────────

export interface UploadRequest {
  accountId: string;
  videoPath: string;
  platforms: ("tiktok" | "youtube" | "instagram")[];
  scheduledFor?: string | null;
  script?: string;
  niche?: string;
  brandTone?: string;
  title?: string;
  caption?: string;
  tags?: string[];
}

export interface PlannedPost {
  id: string;
  accountId: string;
  platform: "tiktok" | "youtube" | "instagram";
  scheduledFor: string;
  status: "planned" | "ready" | "uploaded" | "failed";
  videoPath?: string;
  caption?: string;
  title?: string;
  tags?: string[];
}

export interface TrendInsight {
  topic: string;
  examples: string[];
  performanceHint: string;
}

export interface UploadResult {
  platform: "tiktok" | "youtube" | "instagram";
  ok: boolean;
  message?: string;
  url?: string;
  error?: string;
}
