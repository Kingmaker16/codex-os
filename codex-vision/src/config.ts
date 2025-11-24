/**
 * Vision Engine v2 - Configuration
 * 
 * Multi-modal AGI perception system
 */

export const CONFIG = {
  // Service
  port: 4600,
  serviceName: "codex-vision",
  version: "2.0.0",
  
  // Brain integration
  brainUrl: "http://localhost:4100",
  visionLogSession: "codex-vision-log",
  arSession: "codex-vision-ar",
  videoSession: "codex-vision-video",
  uiSession: "codex-vision-ui",
  
  // Bridge URL for vision models
  bridgeUrl: "http://localhost:4000",
  
  // Vision models
  visionProviders: [
    { provider: "openai", model: "gpt-4o" },           // GPT-4 Vision
    { provider: "claude", model: "claude-3-5-sonnet-20241022" }, // Claude Vision
    { provider: "gemini", model: "gemini-1.5-pro" },   // Gemini Vision
    { provider: "grok", model: "grok-beta" }           // Grok Vision
  ],
  
  // Vision parameters
  fusionConfidenceThreshold: 0.7,
  maxImageSize: 10 * 1024 * 1024,  // 10MB
  maxVideoChunks: 50,
  keyframeInterval: 30,             // Extract keyframe every N frames
  
  // UI detection profiles
  uiProfiles: {
    photoshop: {
      toolbars: ["left", "top", "right"],
      panels: ["layers", "properties", "history"],
      canvas: "center"
    },
    finalcut: {
      toolbars: ["top"],
      panels: ["browser", "inspector", "timeline"],
      canvas: "viewer"
    },
    logic: {
      toolbars: ["top", "left"],
      panels: ["library", "inspector", "mixer"],
      canvas: "arrangement"
    },
    chrome: {
      toolbars: ["top"],
      panels: ["tabs", "bookmarks"],
      canvas: "page"
    },
    finder: {
      toolbars: ["top", "sidebar"],
      panels: ["sidebar", "statusbar"],
      canvas: "files"
    }
  },
  
  // AR streaming
  arFrameRate: 10,  // FPS
  arMaxLatency: 100, // ms
  
  // Logging
  logAllAnalysis: true,
  verbose: true
} as const;

export type VisionProvider = typeof CONFIG.visionProviders[number];
export type UIProfile = keyof typeof CONFIG.uiProfiles;
