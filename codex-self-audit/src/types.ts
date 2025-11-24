export type IssueType = 
  | "CONTRADICTION"
  | "MISSING_STEP"
  | "CIRCULAR_REASONING"
  | "INCOMPLETE_CHAIN"
  | "SAFETY_VIOLATION"
  | "INCONSISTENCY"
  | "TEMPORAL_MISMATCH"
  | "MODEL_DISAGREEMENT"
  | "QUALITY_ISSUE";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Confidence = number; // 0-1

export interface Finding {
  id: string;
  type: IssueType;
  severity: Severity;
  confidence: Confidence;
  description: string;
  location?: string;
  context?: string;
}

export interface FixSuggestion {
  id: string;
  findingId: string;
  action: string;
  rationale: string;
  estimatedImpact: string;
  requiresApproval: boolean;
}

export interface LLMVerdict {
  provider: string;
  model: string;
  verdict: "PASS" | "FAIL" | "WARNING";
  confidence: Confidence;
  notes: string;
}

export interface QualityScore {
  overall: number; // 0-100
  clarity: number;
  completeness: number;
  correctness: number;
  safety: number;
  usefulness: number;
}

export interface AuditRequest {
  sessionId: string;
  content: string;
  contentType: "output" | "plan" | "task" | "action" | "reasoning";
  context?: {
    relatedMemories?: string[];
    dependencies?: string[];
    constraints?: string[];
  };
  enableLLMValidation?: boolean;
  enableSafetyCheck?: boolean;
  enableConsistencyCheck?: boolean;
}

export interface AuditReport {
  ok: boolean;
  sessionId: string;
  timestamp: string;
  contentType: string;
  findings: Finding[];
  llmVerdicts?: LLMVerdict[];
  qualityScore: QualityScore;
  overallConfidence: Confidence;
  suggestions: FixSuggestion[];
  shouldBlock: boolean;
  summary: string;
}

export interface BatchAuditRequest {
  items: AuditRequest[];
}

export interface BatchAuditReport {
  ok: boolean;
  reports: AuditReport[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    blocked: number;
  };
}
