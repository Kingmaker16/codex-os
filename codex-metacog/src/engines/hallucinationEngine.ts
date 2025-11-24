import { MetaFinding } from "../types.js";

export function detectHallucinationRisk(text: string): MetaFinding[] {
  const riskyPatterns = [
    "100% guaranteed",
    "always works",
    "never fails",
    "absolutely certain",
    "without any doubt",
    "impossible to fail"
  ];
  
  const found = riskyPatterns.filter(r => text.toLowerCase().includes(r));
  
  return found.length > 0 ? [{
    type: "HALLUCINATION_RISK",
    severity: "HIGH" as const,
    description: `Detected overly certain statements: ${found.join(", ")}`
  }] : [];
}
