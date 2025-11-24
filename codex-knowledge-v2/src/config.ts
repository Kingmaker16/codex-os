/**
 * Knowledge Engine v2.5 - Configuration
 * 
 * C1 STRICT MODE:
 * - Only learns from explicit research requests
 * - No background learning or auto-ingestion
 * - All knowledge must be approved
 * - Domain kernels isolated by strict rules
 */

export const CONFIG = {
  port: 4500,
  mode: "C1-STRICT" as const,
  
  // C1 Mode Rules
  c1Rules: {
    explicitOnly: true,        // Only process explicit /research requests
    noAutoLearn: true,          // Never auto-ingest from conversations
    requireApproval: false,     // Auto-approve research (trusted sources)
    isolatedDomains: true,      // Domain kernels don't cross-pollinate
    auditLogging: true,         // Log all knowledge operations to Brain
  },

  // Model providers for fusion
  providers: [
    { name: "openai", model: "gpt-4o" },
    { name: "claude", model: "claude-haiku-4-5-20251001" },
    { name: "gemini", model: "gemini-2.5-pro" },
    { name: "grok", model: "grok-4-latest" }
  ],

  // Domain kernels
  domains: [
    "trading",
    "ecomm",
    "kingmaker",
    "social",
    "creative",
    "generic"
  ] as const,

  // Bridge integration
  bridgeUrl: "http://localhost:4000",
  brainUrl: "http://localhost:4100",

  // Processing limits
  maxChunkSize: 2000,
  maxConcurrentRequests: 4,
  fusionTimeout: 30000,

  // Content ingestion
  supportedFormats: {
    web: ["html", "text"],
    documents: ["pdf", "txt", "md"],
    media: ["youtube", "audio", "video"],
    visual: ["screenshot", "image"]
  }
};

export type Domain = typeof CONFIG.domains[number];
export type Provider = typeof CONFIG.providers[number];
