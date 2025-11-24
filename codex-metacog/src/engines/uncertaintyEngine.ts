import { MetaFinding } from "../types.js";

export function detectUncertainty(text: string): MetaFinding[] {
  const patterns = ["maybe", "probably", "not sure", "unclear", "might", "could be"];
  const matches = patterns.filter(p => text.toLowerCase().includes(p));
  return matches.length > 0 ? [{
    type: "UNCERTAINTY",
    severity: "MEDIUM" as const,
    description: `Detected uncertainty indicators: ${matches.join(", ")}`
  }] : [];
}
