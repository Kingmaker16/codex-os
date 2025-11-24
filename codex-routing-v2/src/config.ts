// Content Routing Engine v2 ULTRA - Configuration

export const CONFIG = {
  SERVICE_NAME: 'codex-routing-v2',
  VERSION: '2.0.0',
  PORT: parseInt(process.env.PORT || '5560', 10),

  // Scoring weights (must sum to 1.0)
  SCORE_WEIGHTS: {
    trend: 0.35,      // Trend alignment importance
    visibility: 0.30,  // Visibility potential importance
    risk: 0.20,        // Risk mitigation importance
    velocity: 0.15     // Velocity optimization importance
  },

  // LLM providers for routing decisions
  LLM_PROVIDERS: ['gpt4o', 'claude', 'gemini', 'grok'],

  // Minimum scores
  MIN_ROUTE_SCORE: 0.5,
  MIN_CONFIDENCE: 0.6,
  MIN_CONSENSUS: 0.5, // At least 50% LLM agreement

  // Service endpoints
  SERVICES: {
    BRIDGE: process.env.BRIDGE_URL || 'http://localhost:4000',
    BRAIN_V2: process.env.BRAIN_URL || 'http://localhost:4100',
    TRENDS: process.env.TRENDS_URL || 'http://localhost:5060',
    VISIBILITY: process.env.VISIBILITY_URL || 'http://localhost:5080',
    ACCOUNTS: process.env.ACCOUNTS_URL || 'http://localhost:5090',
    DISTRIBUTION_V2: process.env.DISTRIBUTION_V2_URL || 'http://localhost:5301',
    CREATIVE_SUITE: process.env.CREATIVE_SUITE_URL || 'http://localhost:5250',
    OPS: process.env.OPS_URL || 'http://localhost:5350'
  },

  // Platform configurations
  PLATFORMS: {
    tiktok: { maxRisk: 0.7, optimalLength: 30, peakHours: [10, 14, 18, 20] },
    youtube: { maxRisk: 0.5, optimalLength: 600, peakHours: [12, 18] },
    instagram: { maxRisk: 0.6, optimalLength: 60, peakHours: [9, 12, 17, 21] },
    twitter: { maxRisk: 0.8, optimalLength: 15, peakHours: [8, 12, 16, 20] },
    linkedin: { maxRisk: 0.4, optimalLength: 180, peakHours: [8, 12, 17] }
  }
};
