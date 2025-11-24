export const CONFIG = {
  PORT: 5301,
  SERVICE_NAME: "codex-distribution-v2",
  VERSION: "2.0.0",
  SAFETY_MODE: "SEMI_AUTONOMOUS" as const,

  SERVICES: {
    BRIDGE: "http://localhost:4000",
    BRAIN: "http://localhost:4100",
    ORCHESTRATOR: "http://localhost:4200",
    HANDS: "http://localhost:4350",
    VIDEO: "http://localhost:4700",
    SOCIAL: "http://localhost:4800",
    TRENDS: "http://localhost:5060",
    VISIBILITY: "http://localhost:5080",
    ACCOUNTS: "http://localhost:5090",
    CREATIVE_SUITE: "http://localhost:5250",
    ROTATION: "http://localhost:5550",
    OPS: "http://localhost:5350"
  },

  LLM_PROVIDERS: [
    { provider: "openai", model: "gpt-4o" },
    { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
    { provider: "google", model: "gemini-2.5-flash" },
    { provider: "xai", model: "grok-4-latest" }
  ],

  PLATFORMS: {
    tiktok: {
      maxPostsPerDay: 5,
      minGapHours: 4,
      peakHours: [10, 14, 18, 20],
      contentTypes: ["video", "short"]
    },
    youtube: {
      maxPostsPerDay: 2,
      minGapHours: 12,
      peakHours: [12, 18],
      contentTypes: ["video"]
    },
    instagram: {
      maxPostsPerDay: 4,
      minGapHours: 6,
      peakHours: [9, 12, 17, 21],
      contentTypes: ["reel", "post", "story"]
    },
    twitter: {
      maxPostsPerDay: 8,
      minGapHours: 2,
      peakHours: [8, 12, 16, 20],
      contentTypes: ["post"]
    },
    linkedin: {
      maxPostsPerDay: 2,
      minGapHours: 24,
      peakHours: [8, 12, 17],
      contentTypes: ["post", "video"]
    }
  },

  LANGUAGES: ["en", "es", "ar"] as const,

  RISK_THRESHOLDS: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.95
  },

  CALENDAR: {
    DAYS_AHEAD: 7,
    SLOTS_PER_DAY: 15,
    AUTO_FILL: true
  },

  TIMEOUTS: {
    LLM_CALL: 30000,
    PUBLISH: 60000,
    REPURPOSE: 120000
  }
};
