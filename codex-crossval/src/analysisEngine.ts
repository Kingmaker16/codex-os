import { CrossValIssue, ModelOutput } from "./types.js";

export interface AnalysisResult {
  confidence: number;
  issues: CrossValIssue[];
  fusedText: string;
}

export function analyzeOutputs(outputs: ModelOutput[]): AnalysisResult {
  const nonEmpty = outputs.filter(o => o.rawOutput && o.rawOutput.trim().length > 0);

  if (nonEmpty.length === 0) {
    return {
      confidence: 0.2,
      issues: [{ type: "UNCERTAINTY", message: "All models returned empty or invalid outputs." }],
      fusedText: ""
    };
  }

  // Basic heuristic: longest output as base
  const sortedByLength = [...nonEmpty].sort((a,b)=>b.rawOutput.length - a.rawOutput.length);
  const base = sortedByLength[0].rawOutput;

  // Detect disagreements by simple text similarity measure
  const issues: CrossValIssue[] = [];
  let disagreementCount = 0;

  for (const out of nonEmpty) {
    if (!textRoughlyMatches(base, out.rawOutput)) {
      disagreementCount++;
    }
  }

  if (disagreementCount > 0) {
    issues.push({
      type: "CONTRADICTION",
      message: `${disagreementCount} model(s) significantly disagreed with the majority answer.`
    });
  }

  const confidenceBase = 1 - (disagreementCount / nonEmpty.length);
  const confidence = Math.max(0.1, confidenceBase);

  return {
    confidence,
    issues,
    fusedText: base
  };
}

function textRoughlyMatches(a: string, b: string): boolean {
  const aNorm = a.toLowerCase().slice(0, 400);
  const bNorm = b.toLowerCase().slice(0, 400);
  let mismatches = 0;
  const minLen = Math.min(aNorm.length, bNorm.length);
  for (let i=0;i<minLen;i++) {
    if (aNorm[i] !== bNorm[i]) mismatches++;
  }
  const ratio = mismatches / (minLen || 1);
  return ratio < 0.35;
}
