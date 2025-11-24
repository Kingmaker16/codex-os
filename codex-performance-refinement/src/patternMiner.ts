import { v4 as uuidv4 } from "uuid";
import { Metrics, Pattern } from "./types.js";

// Simplified pattern mining - in production, use proper statistical analysis
export function minePatterns(
  domain: string,
  metrics: Metrics
): Pattern[] {
  const patterns: Pattern[] = [];

  // Pattern 1: Trend velocity vs engagement correlation
  if (metrics.trendVelocity !== undefined && metrics.engagement !== undefined) {
    const correlation = metrics.trendVelocity * metrics.engagement;
    if (correlation > 300) {
      patterns.push({
        id: uuidv4(),
        name: "High Velocity-Engagement Correlation",
        description: "Strong positive correlation between trend velocity and engagement",
        confidence: 0.85,
        correlation: `r = ${(correlation / 1000).toFixed(2)}`,
        dataPoints: 50
      });
    } else if (correlation < 100) {
      patterns.push({
        id: uuidv4(),
        name: "Weak Velocity-Engagement Link",
        description: "Trending content not translating to engagement",
        confidence: 0.72,
        correlation: `r = ${(correlation / 1000).toFixed(2)}`,
        dataPoints: 50
      });
    }
  }

  // Pattern 2: CTR vs views relationship
  if (metrics.ctr !== undefined && metrics.views !== undefined) {
    const expectedViews = metrics.ctr * 100000; // Simplified model
    const ratio = metrics.views / expectedViews;
    
    if (ratio < 0.5) {
      patterns.push({
        id: uuidv4(),
        name: "Low CTR-to-Views Conversion",
        description: "Click-through rate not converting to sustained viewership",
        confidence: 0.78,
        correlation: `conversion ratio: ${ratio.toFixed(2)}`,
        dataPoints: 100
      });
    }
  }

  // Pattern 3: Posting cadence impact
  if (metrics.postingCadence !== undefined && metrics.engagement !== undefined) {
    const engagementPerPost = metrics.engagement / (metrics.postingCadence || 1);
    
    if (engagementPerPost < 50) {
      patterns.push({
        id: uuidv4(),
        name: "Posting Frequency Saturation",
        description: "High posting frequency diluting engagement per post",
        confidence: 0.68,
        correlation: `engagement/post: ${engagementPerPost.toFixed(0)}`,
        dataPoints: 30
      });
    }
  }

  // Pattern 4: Watch time efficiency
  if (metrics.watchTime !== undefined && metrics.rpm !== undefined) {
    const efficiency = metrics.rpm / (metrics.watchTime || 1);
    
    if (efficiency < 0.2) {
      patterns.push({
        id: uuidv4(),
        name: "Low Monetization Efficiency",
        description: "Watch time not converting to revenue efficiently",
        confidence: 0.81,
        correlation: `RPM/watchTime: ${efficiency.toFixed(3)}`,
        dataPoints: 75
      });
    }
  }

  // Pattern 5: Revenue vs engagement mismatch
  if (metrics.revenue !== undefined && metrics.engagement !== undefined) {
    const revenuePerEngagement = metrics.revenue / (metrics.engagement || 1);
    
    if (revenuePerEngagement < 0.5) {
      patterns.push({
        id: uuidv4(),
        name: "Engagement-Revenue Gap",
        description: "High engagement not translating to proportional revenue",
        confidence: 0.76,
        correlation: `$/engagement: ${revenuePerEngagement.toFixed(2)}`,
        dataPoints: 60
      });
    }
  }

  return patterns;
}

export function identifyFailurePoints(patterns: Pattern[]): string[] {
  const failures: string[] = [];

  for (const pattern of patterns) {
    if (pattern.name.includes("Weak") || pattern.name.includes("Low") || pattern.name.includes("Gap")) {
      failures.push(`${pattern.name}: ${pattern.description}`);
    }
  }

  return failures;
}
