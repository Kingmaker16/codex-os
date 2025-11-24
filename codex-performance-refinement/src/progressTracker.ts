import { Domain, Metrics, ProgressEntry } from "./types.js";

const progressHistory: Map<string, ProgressEntry[]> = new Map();

export function trackProgress(
  domain: Domain,
  metrics: Metrics
): number {
  const key = domain;
  const history = progressHistory.get(key) || [];

  // Calculate improvement score
  const improvementScore = calculateImprovementScore(history, metrics);

  // Add current entry
  const entry: ProgressEntry = {
    date: new Date().toISOString(),
    domain,
    metrics,
    improvementScore
  };

  history.push(entry);

  // Keep only last 7 days
  if (history.length > 7) {
    history.shift();
  }

  progressHistory.set(key, history);

  return improvementScore;
}

function calculateImprovementScore(
  history: ProgressEntry[],
  currentMetrics: Metrics
): number {
  if (history.length === 0) return 0;

  const recentEntry = history[history.length - 1];
  let totalImprovement = 0;
  let metricCount = 0;

  for (const [metric, value] of Object.entries(currentMetrics)) {
    if (value === undefined) continue;
    
    const previousValue = recentEntry.metrics[metric];
    if (previousValue !== undefined && previousValue !== 0) {
      const improvement = ((value - previousValue) / previousValue) * 100;
      totalImprovement += improvement;
      metricCount++;
    }
  }

  return metricCount > 0 ? totalImprovement / metricCount : 0;
}

export function getProgressHistory(
  domain?: Domain,
  days?: number
): ProgressEntry[] {
  const allEntries: ProgressEntry[] = [];

  for (const [key, entries] of progressHistory.entries()) {
    if (domain && !key.includes(domain)) continue;
    allEntries.push(...entries);
  }

  // Sort by date descending
  allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Limit by days
  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return allEntries.filter(e => new Date(e.date) >= cutoffDate);
  }

  return allEntries;
}

export function calculateTrend(history: ProgressEntry[]): "IMPROVING" | "STABLE" | "DECLINING" {
  if (history.length < 3) return "STABLE";

  const recentScores = history.slice(-3).map(e => e.improvementScore);
  const avg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;

  if (avg > 5) return "IMPROVING";
  if (avg < -5) return "DECLINING";
  return "STABLE";
}
