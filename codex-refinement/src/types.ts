// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refinement Layer v1 - Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const REFINEMENT_VERSION = "1.0.0";

export interface RefinementRequest {
  sessionId: string;
  domain: string;
  input: string;
  metadata?: Record<string, any>;
}

export interface RefinementResult {
  ok: boolean;
  sessionId: string;
  domain: string;
  improved: string;
  score: number;
  issues: string[];
  suggestions: string[];
  modelBreakdown: ModelOutput[];
}

export interface ModelOutput {
  provider: string;
  model: string;
  output: string;
  usage?: any;
}

export interface FusionResult {
  improved: string;
  score: number;
  issues: string[];
  suggestions: string[];
  modelBreakdown: ModelOutput[];
}
