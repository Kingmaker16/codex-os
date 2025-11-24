import fetch from "node-fetch";
import { PlatformVisibility } from "./types.js";

export class SocialScanner {
  async scan(platform: string, accountId: string): Promise<PlatformVisibility> {
    const now = new Date().toISOString();
    
    if (platform === "tiktok") {
      return {
        platform,
        shadowban: false,
        reachScore: Math.floor(Math.random() * 60) + 40,
        visibilityLevel: "MEDIUM",
        warnings: [],
        lastChecked: now
      };
    }

    if (platform === "youtube") {
      return {
        platform,
        shadowban: false,
        reachScore: Math.floor(Math.random() * 50) + 30,
        visibilityLevel: "LOW",
        warnings: ["Low early CTR"],
        lastChecked: now
      };
    }

    return {
      platform,
      shadowban: false,
      reachScore: 50,
      visibilityLevel: "MEDIUM",
      warnings: [],
      lastChecked: now
    };
  }
}
