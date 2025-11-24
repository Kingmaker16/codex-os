// Content Routing Engine v2 ULTRA - Route Optimizer

import { CONFIG } from '../config.js';
import type { RouteOption, Platform, Content, OptimizationOptions, ScoreWeights } from '../types.js';
import { scoreTrend } from './trendScorer.js';
import { scoreVisibility } from './visibilityScorer.js';
import { scoreRisk, shouldAllowRoute } from './riskScorer.js';
import { scoreVelocity } from './velocityScorer.js';

export async function optimizeRoutes(
  content: Content,
  platforms: Platform[],
  options?: OptimizationOptions
): Promise<RouteOption[]> {
  const opts: OptimizationOptions = {
    maxRoutes: 5,
    minScore: CONFIG.MIN_ROUTE_SCORE,
    diversifyPlatforms: true,
    prioritizeSafety: false,
    trendBoost: 1.0,
    ...options
  };

  // Score all platforms
  const routes = await Promise.all(
    platforms.map(platform => scoreRoute(content, platform, opts))
  );

  // Filter by minimum score and safety
  let validRoutes = routes.filter(r => 
    r.score >= opts.minScore! && shouldAllowRoute(r.riskScore, r.platform)
  );

  // Sort by score (descending)
  validRoutes.sort((a, b) => b.score - a.score);

  // Apply diversity if requested
  if (opts.diversifyPlatforms && validRoutes.length > opts.maxRoutes!) {
    validRoutes = diversifyRoutes(validRoutes, opts.maxRoutes!);
  } else {
    validRoutes = validRoutes.slice(0, opts.maxRoutes);
  }

  return validRoutes;
}

async function scoreRoute(
  content: Content,
  platform: Platform,
  options: OptimizationOptions
): Promise<RouteOption> {
  // Get individual scores in parallel
  const [trendScore, visibilityScore, riskScore, velocityScore] = await Promise.all([
    scoreTrend(content, platform),
    scoreVisibility(content, platform),
    scoreRisk(content, platform),
    scoreVelocity(content, platform)
  ]);

  // Apply trend boost if specified
  const boostedTrendScore = trendScore * (options.trendBoost || 1.0);

  // Calculate weighted total score
  const weights = options.prioritizeSafety
    ? { trend: 0.25, visibility: 0.25, risk: 0.35, velocity: 0.15 }
    : CONFIG.SCORE_WEIGHTS;

  const totalScore = 
    boostedTrendScore * weights.trend +
    visibilityScore * weights.visibility +
    riskScore * weights.risk +
    velocityScore * weights.velocity;

  // Calculate confidence based on variance
  const scores = [trendScore, visibilityScore, riskScore, velocityScore];
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const confidence = Math.max(0.5, 1 - variance);

  return {
    platform,
    score: Math.max(0, Math.min(1, totalScore)),
    trendScore: boostedTrendScore,
    visibilityScore,
    riskScore,
    velocityScore,
    confidence,
    reasoning: generateReasoning(platform, trendScore, visibilityScore, riskScore, velocityScore)
  };
}

function generateReasoning(
  platform: Platform,
  trendScore: number,
  visibilityScore: number,
  riskScore: number,
  velocityScore: number
): string {
  const reasons: string[] = [];

  if (trendScore > 0.7) {
    reasons.push('high trend alignment');
  } else if (trendScore < 0.4) {
    reasons.push('low trend match');
  }

  if (visibilityScore > 0.7) {
    reasons.push('strong visibility potential');
  }

  if (riskScore < 0.5) {
    reasons.push('elevated risk');
  } else if (riskScore > 0.8) {
    reasons.push('very safe');
  }

  if (velocityScore > 0.8) {
    reasons.push('optimal posting velocity');
  } else if (velocityScore < 0.4) {
    reasons.push('platform saturated');
  }

  if (reasons.length === 0) {
    return `Moderate scores across all factors for ${platform}`;
  }

  return `${platform}: ${reasons.join(', ')}`;
}

function diversifyRoutes(routes: RouteOption[], maxRoutes: number): RouteOption[] {
  const selected: RouteOption[] = [];
  const usedPlatforms = new Set<Platform>();

  // First pass: select top route for each platform
  for (const route of routes) {
    if (!usedPlatforms.has(route.platform)) {
      selected.push(route);
      usedPlatforms.add(route.platform);
      if (selected.length >= maxRoutes) break;
    }
  }

  // Second pass: fill remaining slots with highest scores
  if (selected.length < maxRoutes) {
    for (const route of routes) {
      if (!selected.includes(route)) {
        selected.push(route);
        if (selected.length >= maxRoutes) break;
      }
    }
  }

  return selected;
}

export function reweightScores(routes: RouteOption[], customWeights: ScoreWeights): RouteOption[] {
  return routes.map(route => {
    const newScore = 
      route.trendScore * customWeights.trend +
      route.visibilityScore * customWeights.visibility +
      route.riskScore * customWeights.risk +
      route.velocityScore * customWeights.velocity;

    return {
      ...route,
      score: Math.max(0, Math.min(1, newScore))
    };
  }).sort((a, b) => b.score - a.score);
}
