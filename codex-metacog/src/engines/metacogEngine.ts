import { detectUncertainty } from "./uncertaintyEngine.js";
import { detectContradictions } from "./contradictionEngine.js";
import { detectHallucinationRisk } from "./hallucinationEngine.js";
import { assessClarity } from "./clarityEngine.js";
import { MetaAnalysisRequest, MetaReport } from "../types.js";

export async function runMetaCognition(req: MetaAnalysisRequest): Promise<MetaReport> {
  const findings = [
    ...detectUncertainty(req.text),
    ...detectContradictions(req.text),
    ...detectHallucinationRisk(req.text),
    ...assessClarity(req.text)
  ];

  // Calculate confidence based on findings
  let confidence = 0.95;
  if (findings.length > 0) {
    const hasCritical = findings.some(f => f.severity === "CRITICAL");
    const hasHigh = findings.some(f => f.severity === "HIGH");
    const hasMedium = findings.some(f => f.severity === "MEDIUM");
    
    if (hasCritical) {
      confidence = 0.2;
    } else if (hasHigh) {
      confidence = 0.4;
    } else if (hasMedium) {
      confidence = 0.7;
    }
  }

  const requiresApproval = findings.some(f => f.severity === "HIGH" || f.severity === "CRITICAL");

  return {
    findings,
    confidence,
    requiresApproval,
    improvedVersion: findings.length > 0 
      ? req.text + " [Meta-Cognition: refined for clarity and consistency]"
      : undefined,
    sourceModels: ["uncertainty-engine", "contradiction-engine", "hallucination-engine", "clarity-engine"],
  };
}
