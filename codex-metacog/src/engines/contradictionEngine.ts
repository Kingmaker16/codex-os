import { MetaFinding } from "../types.js";

export function detectContradictions(text: string): MetaFinding[] {
  const findings: MetaFinding[] = [];
  
  // Check for direct contradictions
  if ((text.includes("cannot") || text.includes("can't")) && text.includes("can ")) {
    findings.push({
      type: "CONTRADICTION",
      severity: "HIGH" as const,
      description: "Conflicting statements detected (can/cannot)."
    });
  }
  
  // Check for yes/no contradictions
  if (text.toLowerCase().includes("yes") && text.toLowerCase().includes("no")) {
    findings.push({
      type: "CONTRADICTION",
      severity: "HIGH" as const,
      description: "Contradictory yes/no statements detected."
    });
  }
  
  return findings;
}
