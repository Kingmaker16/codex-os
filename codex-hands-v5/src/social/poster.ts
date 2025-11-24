// =============================================
// H5-SOCIAL: POSTER ENGINE
// =============================================

import fetch from "node-fetch";
import { SocialPostRequest } from "../types.js";
import { generateId, timestamp } from "../utils.js";

const ACCOUNTS_URL = "http://localhost:5090"; // Account Safety Engine

export class PosterEngine {
  async postToTikTok(request: SocialPostRequest): Promise<any> {
    // Check account safety first
    const safetyCheck = await this.checkAccountSafety(request.accountId, "tiktok");
    if (!safetyCheck.allowed) {
      return {
        ok: false,
        error: "Account safety check failed",
        recommendation: safetyCheck.recommendation
      };
    }

    return {
      ok: true,
      platform: "tiktok",
      postId: generateId(),
      accountId: request.accountId,
      caption: request.content.caption,
      videoPath: request.content.videoPath,
      hashtags: request.content.hashtags,
      scheduled: request.schedule,
      postedAt: timestamp(),
      message: "Posted to TikTok (simulated)"
    };
  }

  async postToYouTube(request: SocialPostRequest): Promise<any> {
    const safetyCheck = await this.checkAccountSafety(request.accountId, "youtube");
    if (!safetyCheck.allowed) {
      return {
        ok: false,
        error: "Account safety check failed",
        recommendation: safetyCheck.recommendation
      };
    }

    return {
      ok: true,
      platform: "youtube",
      postId: generateId(),
      accountId: request.accountId,
      title: request.content.caption?.substring(0, 100),
      videoPath: request.content.videoPath,
      scheduled: request.schedule,
      postedAt: timestamp(),
      message: "Posted to YouTube (simulated)"
    };
  }

  async postToInstagram(request: SocialPostRequest): Promise<any> {
    const safetyCheck = await this.checkAccountSafety(request.accountId, "instagram");
    if (!safetyCheck.allowed) {
      return {
        ok: false,
        error: "Account safety check failed",
        recommendation: safetyCheck.recommendation
      };
    }

    return {
      ok: true,
      platform: "instagram",
      postId: generateId(),
      accountId: request.accountId,
      caption: request.content.caption,
      mediaPath: request.content.videoPath || request.content.imagePath,
      hashtags: request.content.hashtags,
      postedAt: timestamp(),
      message: "Posted to Instagram (simulated)"
    };
  }

  private async checkAccountSafety(accountId: string, platform: string): Promise<any> {
    try {
      const resp = await fetch(`${ACCOUNTS_URL}/accounts/evaluatePost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          platform,
          contentType: "video"
        })
      });

      if (!resp.ok) {
        return { allowed: true, recommendation: "Safety check unavailable, proceeding" };
      }

      const data = await resp.json() as any;
      return {
        allowed: data.decision?.recommendedAction === "ALLOW",
        recommendation: data.decision?.notes || ""
      };
    } catch (err) {
      console.warn("Account safety check failed:", err);
      return { allowed: true, recommendation: "Safety service unavailable" };
    }
  }

  async verifyPost(postId: string, platform: string): Promise<any> {
    // Simulate verification
    return {
      ok: true,
      postId,
      platform,
      verified: true,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      message: "Post verified"
    };
  }
}

export const posterEngine = new PosterEngine();
