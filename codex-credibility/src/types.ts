// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Credibility Engine v1 - Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CREDIBILITY_VERSION = "1.0.0";

export type CredibilityDomain = "social" | "ecomm" | "ad" | "script" | "email";

export interface CredibilityRequest {
  sessionId: string;
  domain: CredibilityDomain;
  content: string;
  meta?: Record<string, any>;
}

export interface CredibilityIssue {
  type: "VAGUE" | "UNSUPPORTED" | "OVERPROMISE" | "RISKY_CLAIM" | "MISSING_PROOF" | "UNCLEAR";
  message: string;
  suggestion: string;
}

export interface CredibilityResult {
  ok: boolean;
  sessionId: string;
  domain: CredibilityDomain;
  content: string;
  improved: string;
  score: number; // 0-100 trust score
  issues: CredibilityIssue[];
  modelBreakdown?: any[];
}

export interface LLMResponse {
  improved: string;
  score: number;
  issues: CredibilityIssue[];
}
