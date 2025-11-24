import { QualityScore, Finding } from "../types.js";

export function computeQualityScore(
  content: string,
  findings: Finding[]
): QualityScore {
  // Base scores
  let clarity = 100;
  let completeness = 100;
  let correctness = 100;
  let safety = 100;
  let usefulness = 100;

  // Penalize based on findings
  for (const finding of findings) {
    const penalty = finding.severity === "CRITICAL" ? 20 :
                    finding.severity === "HIGH" ? 15 :
                    finding.severity === "MEDIUM" ? 10 : 5;

    switch (finding.type) {
      case "CONTRADICTION":
      case "CIRCULAR_REASONING":
        correctness -= penalty;
        clarity -= penalty * 0.5;
        break;
      case "MISSING_STEP":
      case "INCOMPLETE_CHAIN":
        completeness -= penalty;
        usefulness -= penalty * 0.5;
        break;
      case "SAFETY_VIOLATION":
        safety -= penalty;
        break;
      case "INCONSISTENCY":
      case "TEMPORAL_MISMATCH":
        correctness -= penalty * 0.7;
        break;
      case "MODEL_DISAGREEMENT":
        clarity -= penalty * 0.5;
        correctness -= penalty * 0.5;
        break;
      case "QUALITY_ISSUE":
        usefulness -= penalty * 0.8;
        break;
    }
  }

  // Additional heuristics
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 10) completeness -= 20;
  if (wordCount < 5) usefulness -= 30;

  // Check for unclear language
  const vagueWords = content.match(/\b(maybe|perhaps|possibly|might|could)\b/gi);
  if (vagueWords && vagueWords.length > 3) {
    clarity -= vagueWords.length * 2;
  }

  // Normalize to 0-100
  const normalize = (score: number) => Math.max(0, Math.min(100, score));

  clarity = normalize(clarity);
  completeness = normalize(completeness);
  correctness = normalize(correctness);
  safety = normalize(safety);
  usefulness = normalize(usefulness);

  const overall = (clarity + completeness + correctness + safety + usefulness) / 5;

  return {
    overall: Math.round(overall),
    clarity: Math.round(clarity),
    completeness: Math.round(completeness),
    correctness: Math.round(correctness),
    safety: Math.round(safety),
    usefulness: Math.round(usefulness)
  };
}
