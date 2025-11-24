// =============================================
// H5-CREATIVE: VIDEO MACROS
// =============================================

import { VideoEditRequest, VideoOperation } from "../types.js";
import { adobeEngine } from "./adobeEngine.js";

export class VideoMacros {
  async createTikTokEdit(videoPath: string): Promise<any> {
    const operations: VideoOperation[] = [
      { type: "trim", params: { start: 0, end: 60 } }, // Max 60s
      { type: "colorGrade", params: { preset: "vibrant", intensity: 0.9 } },
      { type: "addText", params: { text: "Hook Text", position: "top" }, timestamp: 0 },
      { type: "addMusic", params: { audioPath: "/library/trending_audio.mp3", volume: 0.6 } }
    ];

    const request: VideoEditRequest = {
      sessionId: "macro-tiktok",
      videoPath,
      operations,
      exportFormat: "tiktok"
    };

    return adobeEngine.editInPremiere(request);
  }

  async createReelsEdit(videoPath: string): Promise<any> {
    const operations: VideoOperation[] = [
      { type: "trim", params: { start: 0, end: 90 } }, // Max 90s
      { type: "colorGrade", params: { preset: "instagram", intensity: 0.85 } },
      { type: "transition", params: { transitionType: "zoom", duration: 0.3 } },
      { type: "addText", params: { text: "Swipe Up →", position: "bottom" }, timestamp: 5 }
    ];

    const request: VideoEditRequest = {
      sessionId: "macro-reels",
      videoPath,
      operations,
      exportFormat: "reels"
    };

    return adobeEngine.editInPremiere(request);
  }

  async createYouTubeEdit(videoPath: string): Promise<any> {
    const operations: VideoOperation[] = [
      { type: "colorGrade", params: { preset: "cinematic", intensity: 0.7 } },
      { type: "addText", params: { text: "Intro Title", position: "center" }, timestamp: 0 },
      { type: "addMusic", params: { audioPath: "/library/background_music.mp3", volume: 0.3 } },
      { type: "addText", params: { text: "Subscribe!", position: "bottom-right" }, timestamp: 10 }
    ];

    const request: VideoEditRequest = {
      sessionId: "macro-youtube",
      videoPath,
      operations,
      exportFormat: "youtube"
    };

    return adobeEngine.editInPremiere(request);
  }

  async autoHookCutter(videoPath: string, hookDuration: number = 3): Promise<any> {
    // Extract first N seconds as hook
    const operations: VideoOperation[] = [
      { type: "trim", params: { start: 0, end: hookDuration } },
      { type: "colorGrade", params: { preset: "vibrant", intensity: 1.0 } }
    ];

    const request: VideoEditRequest = {
      sessionId: "hook-cutter",
      videoPath,
      operations,
      exportFormat: "custom"
    };

    return adobeEngine.editInPremiere(request);
  }

  async batchExport(videoPaths: string[], format: "tiktok" | "reels" | "youtube"): Promise<any[]> {
    const results = [];
    
    for (const path of videoPaths) {
      let result;
      switch (format) {
        case "tiktok":
          result = await this.createTikTokEdit(path);
          break;
        case "reels":
          result = await this.createReelsEdit(path);
          break;
        case "youtube":
          result = await this.createYouTubeEdit(path);
          break;
      }
      results.push(result);
    }

    return results;
  }
}

export const videoMacros = new VideoMacros();
