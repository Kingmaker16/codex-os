export interface SimulationRequest {
  sessionId: string;
  scenario: "social_ecomm_launch" | "content_only" | "store_only";
  niche: string;
  productName?: string;
  days?: number;
}

export interface SimulationStepResult {
  step: string;
  ok: boolean;
  details?: any;
  error?: string;
}

export interface SimulationResult {
  ok: boolean;
  scenario: string;
  sessionId: string;
  steps: SimulationStepResult[];
  summary: string;
}
