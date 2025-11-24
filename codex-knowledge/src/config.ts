/**
 * Knowledge Engine v2 - Configuration
 * 
 * C1 FOCUSED RESEARCH MODE:
 * - NO automatic background learning
 * - ONLY learn when user explicitly requests
 * - All research tasks must be manually triggered
 * - Full logging to Brain for audit trail
 */

export const RESEARCH_MODE = "C1" as const;

export const CONFIG = {
  // Research mode
  mode: RESEARCH_MODE,
  
  // Brain integration
  brainUrl: "http://localhost:4100",
  researchSessionId: "codex-research-log",
  
  // Bridge URL for multi-model fusion
  bridgeUrl: "http://localhost:4000",
  
  // Domain kernels (stored in Brain)
  domains: [
    "codex-skill-trading",
    "codex-skill-ecomm",
    "codex-skill-kingmaker",
    "codex-skill-social",
    "codex-skill-creative"
  ] as const,
  
  // Multi-model fusion providers
  fusionProviders: [
    { provider: "openai", model: "gpt-4o" },
    { provider: "claude", model: "claude-3-5-sonnet-20241022" },
    { provider: "gemini", model: "gemini-1.5-pro" },
    { provider: "grok", model: "grok-beta" }
  ],
  
  // C1 Mode flags
  autoRefine: false,           // NO automatic refinement
  backgroundLearning: false,   // NO background tasks
  explicitOnly: true,          // ONLY respond to explicit requests
  
  // Research parameters
  maxChunkSize: 2000,          // Characters per chunk
  minChunkSize: 200,           // Minimum chunk size
  fusionConfidenceThreshold: 0.7,  // Min confidence for fusion results
  
  // Logging
  logAllResearch: true,
  verbose: true
} as const;

export type DomainKernel = typeof CONFIG.domains[number];
export type ResearchMode = typeof RESEARCH_MODE;
