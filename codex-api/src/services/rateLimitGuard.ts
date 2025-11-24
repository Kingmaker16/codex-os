// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Rate Limit Guard (Per-Platform Throttling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { RATE_LIMITS } from "../config.js";
import type { Platform, RateLimitConfig } from "../types.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit tracking (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get rate limit config for a platform
 */
function getRateLimitConfig(platform: Platform): RateLimitConfig | undefined {
  return RATE_LIMITS.find((limit) => limit.platform === platform);
}

/**
 * Check if request is allowed under rate limit
 */
export function checkRateLimit(
  platform: Platform,
  accountId: string = "default"
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = getRateLimitConfig(platform);
  
  if (!config) {
    // No rate limit configured, allow request
    return { allowed: true, remaining: Infinity, resetAt: 0 };
  }
  
  const key = `${platform}:${accountId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  const allowed = entry.count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  if (allowed) {
    entry.count++;
  }
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Consume rate limit (increment counter)
 */
export function consumeRateLimit(
  platform: Platform,
  accountId: string = "default"
): void {
  const key = `${platform}:${accountId}`;
  const entry = rateLimitStore.get(key);
  
  if (entry) {
    entry.count++;
  }
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(
  platform: Platform,
  accountId: string = "default"
): { used: number; limit: number; remaining: number; resetAt: number } {
  const config = getRateLimitConfig(platform);
  
  if (!config) {
    return { used: 0, limit: Infinity, remaining: Infinity, resetAt: 0 };
  }
  
  const key = `${platform}:${accountId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now >= entry.resetAt) {
    return {
      used: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }
  
  return {
    used: entry.count,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a platform/account
 */
export function resetRateLimit(
  platform: Platform,
  accountId: string = "default"
): void {
  const key = `${platform}:${accountId}`;
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries (background job)
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
