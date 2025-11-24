// captionEngine.ts - Caption & Subtitle Generation Engine

import type { CaptionPlan, CaptionTiming } from "./types.js";

export class CaptionEngine {
  /**
   * Generate optimized caption plan for video
   */
  generateCaptionPlan(
    platform: string,
    videoScript?: string,
    hooks?: string[]
  ): CaptionPlan {
    console.log(`[CaptionEngine] Generating caption plan for ${platform}`);

    const mainCaption = this.generateMainCaption(platform, hooks);
    const alternates = this.generateAlternates(platform);
    const hashtags = this.generateHashtags(platform);
    const timing = this.generateTiming(videoScript);
    const captionHooks = hooks || this.getDefaultHooks(platform);

    return {
      mainCaption,
      alternates,
      hashtags,
      timing,
      hooks: captionHooks,
    };
  }

  /**
   * Generate main caption text
   */
  private generateMainCaption(platform: string, hooks?: string[]): string {
    const hook = hooks?.[0] || "🔥 You need to see this";
    const platformEmojis: Record<string, string> = {
      tiktok: "🎵",
      reels: "📸",
      youtube: "▶️",
      shorts: "⚡",
    };

    const emoji = platformEmojis[platform] || "✨";
    return `${hook} ${emoji}\n\nFollow for more tips! 🚀`;
  }

  /**
   * Generate alternate caption variations
   */
  private generateAlternates(platform: string): string[] {
    const templates = [
      `POV: You just discovered the secret to ${platform} growth 📈`,
      `This changed everything for my ${platform} strategy 💡`,
      `Nobody talks about this ${platform} trick 🤫`,
      `Day 1 vs Day 30 on ${platform} 🔥`,
      `The ${platform} algorithm loves this 👀`,
    ];

    return templates.slice(0, 3);
  }

  /**
   * Generate platform-specific hashtags
   */
  private generateHashtags(platform: string): string[] {
    const universal = ["viral", "fyp", "trending", "explore", "2024"];

    const platformSpecific: Record<string, string[]> = {
      tiktok: ["tiktok", "foryou", "foryoupage", "tiktoktips"],
      reels: ["reels", "reelsinstagram", "instagram", "instagramreels"],
      youtube: ["shorts", "youtube", "youtubeshorts", "subscribe"],
      shorts: ["shorts", "youtubeshorts", "shortsvideo", "viral"],
    };

    const specific = platformSpecific[platform] || platformSpecific["tiktok"];
    return [...universal, ...specific].map((tag) => `#${tag}`);
  }

  /**
   * Generate caption timing overlays
   */
  private generateTiming(videoScript?: string): CaptionTiming[] {
    if (!videoScript) {
      return this.getDefaultTiming();
    }

    // Split script into sentences/phrases
    const phrases = videoScript.split(/[.!?]+/).filter((p) => p.trim().length > 0);
    const timing: CaptionTiming[] = [];
    const durationPerPhrase = 3; // 3 seconds per phrase

    phrases.forEach((phrase, index) => {
      timing.push({
        text: phrase.trim(),
        start: index * durationPerPhrase,
        end: (index + 1) * durationPerPhrase,
        position: index % 2 === 0 ? "bottom" : "center",
        style: index === 0 ? "bold" : undefined,
      });
    });

    return timing;
  }

  /**
   * Get default timing if no script provided
   */
  private getDefaultTiming(): CaptionTiming[] {
    return [
      {
        text: "WATCH THIS",
        start: 0.5,
        end: 2.0,
        position: "top",
        style: "bold",
      },
      {
        text: "This is insane 🔥",
        start: 3.0,
        end: 5.0,
        position: "center",
        style: "animated",
      },
      {
        text: "Follow for more 👆",
        start: 8.0,
        end: 10.0,
        position: "bottom",
        style: "bold",
      },
    ];
  }

  /**
   * Get default hooks for platform
   */
  private getDefaultHooks(platform: string): string[] {
    return [
      "Stop scrolling right now",
      "You won't believe this",
      "This changed my life",
      "Watch until the end",
      "Nobody talks about this",
    ];
  }

  /**
   * Generate SRT subtitle file content
   */
  generateSRT(timing: CaptionTiming[]): string {
    let srtContent = "";

    timing.forEach((caption, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${this.formatSRTTime(caption.start)} --> ${this.formatSRTTime(caption.end)}\n`;
      srtContent += `${caption.text}\n\n`;
    });

    return srtContent;
  }

  /**
   * Format time for SRT format (HH:MM:SS,mmm)
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
  }

  /**
   * Optimize caption length for platform
   */
  optimizeCaptionLength(caption: string, platform: string): string {
    const maxLengths: Record<string, number> = {
      tiktok: 150,
      reels: 2200,
      youtube: 5000,
      shorts: 5000,
    };

    const maxLength = maxLengths[platform] || 150;

    if (caption.length <= maxLength) return caption;

    // Truncate and add ellipsis
    return caption.substring(0, maxLength - 3) + "...";
  }

  /**
   * Extract key phrases from caption for overlay
   */
  extractKeyPhrases(caption: string, count: number = 3): string[] {
    // Simple extraction - split by sentences and punctuation
    const phrases = caption
      .split(/[.!?\n]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 5 && p.length < 50);

    return phrases.slice(0, count);
  }

  /**
   * Generate emoji-enhanced caption
   */
  enhanceWithEmojis(caption: string): string {
    const emojiMap: Record<string, string> = {
      fire: "🔥",
      watch: "👀",
      follow: "👆",
      like: "❤️",
      amazing: "✨",
      wow: "😱",
      tips: "💡",
      secret: "🤫",
      growth: "📈",
      viral: "🚀",
    };

    let enhanced = caption;

    Object.entries(emojiMap).forEach(([keyword, emoji]) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(enhanced) && !enhanced.includes(emoji)) {
        enhanced = enhanced.replace(regex, `${keyword} ${emoji}`);
      }
    });

    return enhanced;
  }
}
