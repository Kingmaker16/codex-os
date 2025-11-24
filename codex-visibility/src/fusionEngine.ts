import { TrendSignal, SafetySignal, VisibilityFusionResult } from "./types.js";

export class FusionEngine {
  computeVisibility(
    reachScore: number,
    trend: TrendSignal,
    safety: SafetySignal
  ): VisibilityFusionResult {
    
    let fused = reachScore;
    const reasons: string[] = [];

    fused += trend.intensity * 2;
    reasons.push("Trend added intensity boost");

    if (safety.riskScore > 60) {
      fused -= 20;
      reasons.push("High risk score lowered visibility");
    }

    let status = "HIGH";
    if (fused < 80) status = "MEDIUM";
    if (fused < 60) status = "LOW";
    if (fused < 40) status = "CRITICAL";

    return {
      fusedScore: fused,
      fusedStatus: status,
      reasons
    };
  }
}
