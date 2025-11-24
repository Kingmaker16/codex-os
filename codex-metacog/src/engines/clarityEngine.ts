import { MetaFinding } from "../types.js";

export function assessClarity(text: string): MetaFinding[] {
  const findings: MetaFinding[] = [];
  
  // Too short
  if (text.length < 20) {
    findings.push({
      type: "LOW_CLARITY",
      severity: "MEDIUM" as const,
      description: "Statement too short to provide sufficient context."
    });
  }
  
  // Too long without structure
  if (text.length > 500 && !text.includes(".") && !text.includes("\n")) {
    findings.push({
      type: "LOW_CLARITY",
      severity: "MEDIUM" as const,
      description: "Long unstructured text may lack clarity."
    });
  }
  
  return findings;
}
