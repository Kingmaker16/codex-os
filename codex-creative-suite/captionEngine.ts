// =============================================
// CREATIVE SUITE v1.5 — CAPTION ENGINE
// =============================================

import { Caption, CaptionStyle } from "./types.js";

export function generateCaptions(
  transcript: string,
  platform: "tiktok" | "youtube" | "instagram",
  style: "minimal" | "full" | "keywords"
): Caption[] {
  console.log(`[CaptionEngine] Generating ${style} captions for ${platform}`);

  const words = transcript.split(" ");
  const captions: Caption[] = [];
  const wordsPerCaption = style === "minimal" ? 5 : style === "full" ? 3 : 2;
  
  let currentTime = 0;
  const duration = 0.5; // seconds per caption

  for (let i = 0; i < words.length; i += wordsPerCaption) {
    const text = words.slice(i, i + wordsPerCaption).join(" ");
    
    captions.push({
      startTime: currentTime,
      endTime: currentTime + duration,
      text,
      position: platform === "tiktok" ? "center" : "bottom",
      style: getCaptionStyle(platform, style)
    });

    currentTime += duration;
  }

  return captions;
}

export function getCaptionStyle(
  platform: "tiktok" | "youtube" | "instagram",
  styleType: "minimal" | "full" | "keywords"
): CaptionStyle {
  const baseStyles: Record<string, CaptionStyle> = {
    tiktok: {
      fontSize: 48,
      fontFamily: "Impact",
      color: "#FFFFFF",
      backgroundColor: "#000000",
      animation: "bounce"
    },
    youtube: {
      fontSize: 36,
      fontFamily: "Arial",
      color: "#FFFFFF",
      backgroundColor: "#000000",
      animation: "fade"
    },
    instagram: {
      fontSize: 42,
      fontFamily: "Helvetica",
      color: "#FFFFFF",
      animation: "slide"
    }
  };

  return baseStyles[platform] || baseStyles.tiktok;
}

export function timeCaptions(captions: Caption[], videoFps: number = 30): Caption[] {
  // Adjust caption timing based on video fps and pacing
  console.log(`[CaptionEngine] Timing captions for ${videoFps} fps`);
  
  return captions.map((caption, index) => ({
    ...caption,
    startTime: (index * videoFps) / videoFps,
    endTime: ((index + 1) * videoFps) / videoFps
  }));
}

export function generateSubtitleFile(captions: Caption[], format: "srt" | "vtt" = "srt"): string {
  console.log(`[CaptionEngine] Generating ${format.toUpperCase()} subtitle file`);

  if (format === "srt") {
    return captions.map((caption, index) => {
      const start = formatSrtTime(caption.startTime);
      const end = formatSrtTime(caption.endTime);
      return `${index + 1}\n${start} --> ${end}\n${caption.text}\n`;
    }).join("\n");
  }

  // VTT format
  return "WEBVTT\n\n" + captions.map((caption, index) => {
    const start = formatVttTime(caption.startTime);
    const end = formatVttTime(caption.endTime);
    return `${start} --> ${end}\n${caption.text}`;
  }).join("\n\n");
}

function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function formatVttTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`;
}

function pad(num: number, length: number = 2): string {
  return String(num).padStart(length, "0");
}
