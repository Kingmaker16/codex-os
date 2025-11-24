import { Metrics, Weakness, WeaknessType, ImpactLevel } from "./types.js";

// Benchmark values for various metrics
const BENCHMARKS: Record<string, number> = {
  ctr: 0.5,
  engagement: 1000,
  trendVelocity: 0.7,
  watchTime: 30,
  rpm: 5.0,
  views: 50000,
  revenue: 1000
};

// Historical data for rolling averages (simplified - in production, fetch from DB)
const historicalData: Map<string, number[]> = new Map();

export function detectWeaknesses(
  domain: string,
  metrics: Metrics
): Weakness[] {
  const weaknesses: Weakness[] = [];

  for (const [metric, value] of Object.entries(metrics)) {
    if (value === undefined || value === null) continue;

    const benchmark = BENCHMARKS[metric];
    const history = historicalData.get(metric) || [];
    
    // Check for decline
    if (history.length >= 3) {
      const recentAvg = history.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
      const delta = value - recentAvg;
      const percentChange = (delta / recentAvg) * 100;

      if (percentChange < -10) {
        weaknesses.push({
          metric,
          type: "DECLINE",
          severity: percentChange < -30 ? "HIGH" : percentChange < -20 ? "MEDIUM" : "LOW",
          currentValue: value,
          benchmark: recentAvg,
          delta,
          description: `${metric} declined by ${Math.abs(percentChange).toFixed(1)}% from recent average`
        });
      }

      // Check for plateau
      const variance = history.slice(-5).reduce((sum, v) => {
        const diff = v - recentAvg;
        return sum + diff * diff;
      }, 0) / 5;

      if (variance < 0.01 && history.length >= 5) {
        weaknesses.push({
          metric,
          type: "PLATEAU",
          severity: "MEDIUM",
          currentValue: value,
          description: `${metric} has plateaued with minimal variance over last 5 periods`
        });
      }
    }

    // Check for underperformance vs benchmark
    if (benchmark && value < benchmark * 0.7) {
      const gap = ((benchmark - value) / benchmark) * 100;
      weaknesses.push({
        metric,
        type: "UNDERPERFORMANCE",
        severity: gap > 50 ? "HIGH" : gap > 30 ? "MEDIUM" : "LOW",
        currentValue: value,
        benchmark,
        delta: value - benchmark,
        description: `${metric} is ${gap.toFixed(1)}% below benchmark of ${benchmark}`
      });
    }

    // Update history
    history.push(value);
    if (history.length > 10) history.shift();
    historicalData.set(metric, history);
  }

  return weaknesses;
}

export function getSeverityScore(weaknesses: Weakness[]): number {
  let score = 0;
  for (const weakness of weaknesses) {
    if (weakness.severity === "HIGH") score += 3;
    else if (weakness.severity === "MEDIUM") score += 2;
    else score += 1;
  }
  return score;
}
