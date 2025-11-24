import { v4 as uuidv4 } from "uuid";
import { ABTestDesign, Domain, KPI } from "../types.js";

export function designABTests(
  domain: Domain,
  kpis: KPI[]
): ABTestDesign[] {
  const tests: ABTestDesign[] = [];

  if (domain === "social" || domain === "all") {
    tests.push({
      id: uuidv4(),
      domain: "social",
      hypothesis: "Hook style affects engagement rate",
      variantA: "Question-based hooks",
      variantB: "Statement-based hooks",
      metrics: ["engagement_rate", "view_duration", "shares"],
      duration: "7 days",
      sampleSize: 100
    });
  }

  if (domain === "video" || domain === "all") {
    tests.push({
      id: uuidv4(),
      domain: "video",
      hypothesis: "Video length impacts completion rate",
      variantA: "15-second videos",
      variantB: "30-second videos",
      metrics: ["completion_rate", "retention", "engagement"],
      duration: "7 days",
      sampleSize: 50
    });
  }

  if (domain === "campaigns" || domain === "all") {
    tests.push({
      id: uuidv4(),
      domain: "campaigns",
      hypothesis: "Posting time affects reach",
      variantA: "Morning posts (8-10 AM)",
      variantB: "Evening posts (6-8 PM)",
      metrics: ["reach", "impressions", "engagement"],
      duration: "14 days",
      sampleSize: 200
    });
  }

  return tests;
}

export function analyzeABTestResults(
  testId: string,
  variantAMetrics: Record<string, number>,
  variantBMetrics: Record<string, number>
): { winner: "A" | "B" | "TIE"; confidence: number; summary: string } {
  // Simple comparison - in production, use proper statistical tests
  let aWins = 0;
  let bWins = 0;

  for (const metric in variantAMetrics) {
    if (variantAMetrics[metric] > variantBMetrics[metric]) aWins++;
    else if (variantBMetrics[metric] > variantAMetrics[metric]) bWins++;
  }

  const total = Object.keys(variantAMetrics).length;
  const winner = aWins > bWins ? "A" : bWins > aWins ? "B" : "TIE";
  const confidence = Math.max(aWins, bWins) / total;

  return {
    winner,
    confidence,
    summary: `Variant ${winner} performed better on ${Math.max(aWins, bWins)}/${total} metrics`
  };
}
