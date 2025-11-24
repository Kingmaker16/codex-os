import { RefinementRequest, RefinementReport } from "./types.js";
import { detectWeaknesses, getSeverityScore } from "./weaknessDetector.js";
import { minePatterns, identifyFailurePoints } from "./patternMiner.js";
import { generateRecommendations } from "./recommendationEngine.js";
import { trackProgress } from "./progressTracker.js";
import { logRefinementToBrain } from "./brainLogger.js";

export async function runRefinement(req: RefinementRequest): Promise<RefinementReport> {
  const timestamp = new Date().toISOString();

  // Step 1: Detect weaknesses
  const weaknesses = detectWeaknesses(req.domain, req.metrics);

  // Step 2: Mine patterns
  const patterns = minePatterns(req.domain, req.metrics);

  // Step 3: Generate recommendations
  const { recommendations, llmConsensus } = await generateRecommendations(
    req.domain,
    weaknesses,
    patterns,
    req.includeLLMRecommendations ?? true
  );

  // Step 4: Track progress
  const improvementScore = trackProgress(req.domain, req.metrics);

  // Step 5: Build report
  const report: RefinementReport = {
    ok: true,
    sessionId: req.sessionId,
    domain: req.domain,
    timestamp,
    weaknesses,
    patterns,
    recommendations,
    improvementScore,
    llmConsensus
  };

  // Step 6: Log to Brain
  await logRefinementToBrain(report);

  return report;
}

export function calculateOverallHealth(report: RefinementReport): {
  score: number;
  grade: string;
  status: string;
} {
  const severityScore = getSeverityScore(report.weaknesses);
  const weaknessCount = report.weaknesses.length;
  const improvementScore = report.improvementScore;

  // Health score: 100 - penalties
  let score = 100;
  score -= severityScore * 5; // Each severity point costs 5
  score -= weaknessCount * 3; // Each weakness costs 3
  score += improvementScore * 2; // Improvement adds points

  score = Math.max(0, Math.min(100, score));

  let grade = "F";
  let status = "CRITICAL";

  if (score >= 90) { grade = "A"; status = "EXCELLENT"; }
  else if (score >= 80) { grade = "B"; status = "GOOD"; }
  else if (score >= 70) { grade = "C"; status = "FAIR"; }
  else if (score >= 60) { grade = "D"; status = "NEEDS IMPROVEMENT"; }
  else { grade = "F"; status = "CRITICAL"; }

  return { score, grade, status };
}
