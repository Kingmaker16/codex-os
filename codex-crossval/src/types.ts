export type Domain =
  | "strategy"
  | "creative"
  | "trend"
  | "ecomm"
  | "social"
  | "ops"
  | "system";

export interface CrossValRequest {
  sessionId: string;
  domain: Domain;
  prompt: string;
  maxTokens?: number;
}

export interface ModelOutput {
  provider: string;
  model: string;
  rawOutput: string;
}

export interface CrossValIssue {
  type: "CONTRADICTION" | "UNCERTAINTY" | "HALLUCINATION_SUSPECTED" | "RISKY_ADVICE";
  message: string;
}

export interface CrossValResult {
  ok: boolean;
  sessionId: string;
  domain: Domain;
  fusedAnswer: string;
  confidence: number; // 0-1
  issues: CrossValIssue[];
  modelOutputs: ModelOutput[];
}
