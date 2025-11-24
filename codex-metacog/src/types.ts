export interface MetaAnalysisRequest {
  text: string;
  context?: any;
}

export interface MetaFinding {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

export interface MetaReport {
  findings: MetaFinding[];
  confidence: number;
  requiresApproval: boolean;
  improvedVersion?: string;
  sourceModels: string[];
}
