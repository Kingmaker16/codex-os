// Content Routing Engine v2 ULTRA - Route Simulator

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { RouteOption, SimulationResult } from '../types.js';

export async function simulateRoute(route: RouteOption, contentId: string): Promise<SimulationResult> {
  // Predict reach
  const predictedReach = await predictReach(route);

  // Predict engagement
  const predictedEngagement = await predictEngagement(route, predictedReach);

  // Calculate risk
  const predictedRisk = 1 - route.riskScore; // Invert (higher riskScore = lower risk)

  // Estimate revenue
  const estimatedRevenue = await estimateRevenue(route, predictedReach, predictedEngagement);

  // Calculate success probability
  const successProbability = calculateSuccessProbability(route, predictedRisk);

  // Generate warnings
  const warnings = generateWarnings(route, predictedRisk);

  // Generate recommendations
  const recommendations = generateRecommendations(route, successProbability);

  return {
    routeId: `sim-${Date.now()}`,
    route,
    predictedReach,
    predictedEngagement,
    predictedRisk,
    estimatedRevenue,
    successProbability,
    warnings,
    recommendations
  };
}

async function predictReach(route: RouteOption): Promise<number> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/predict`, {
      platform: route.platform,
      visibilityScore: route.visibilityScore
    }, { timeout: 3000 });

    return response.data.predictedReach || (route.visibilityScore * 100000);
  } catch (error) {
    // Fallback: estimate based on visibility score
    const platformMultipliers = {
      tiktok: 150000,
      youtube: 50000,
      instagram: 80000,
      twitter: 60000,
      linkedin: 30000
    };
    return route.visibilityScore * (platformMultipliers[route.platform] || 50000);
  }
}

async function predictEngagement(route: RouteOption, reach: number): Promise<number> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/engagement`, {
      platform: route.platform,
      reach,
      trendScore: route.trendScore
    }, { timeout: 3000 });

    return response.data.engagement || (reach * 0.05 * route.trendScore);
  } catch (error) {
    // Fallback: estimate 5% engagement rate, boosted by trend
    return reach * 0.05 * route.trendScore;
  }
}

async function estimateRevenue(route: RouteOption, reach: number, engagement: number): Promise<number> {
  // Revenue estimation based on platform CPM and engagement
  const platformCPM = {
    tiktok: 0.02,
    youtube: 0.05,
    instagram: 0.03,
    twitter: 0.015,
    linkedin: 0.08
  };

  const cpm = platformCPM[route.platform] || 0.03;
  const impressionRevenue = (reach / 1000) * cpm;
  const engagementBonus = engagement * 0.001; // $0.001 per engagement

  return impressionRevenue + engagementBonus;
}

function calculateSuccessProbability(route: RouteOption, risk: number): number {
  // Success = high score + low risk
  const scoreWeight = 0.7;
  const riskWeight = 0.3;

  const safetyFactor = 1 - risk;
  const probability = (route.score * scoreWeight) + (safetyFactor * riskWeight);

  return Math.max(0, Math.min(1, probability));
}

function generateWarnings(route: RouteOption, risk: number): string[] {
  const warnings: string[] = [];

  if (risk > 0.6) {
    warnings.push(`⚠️ HIGH RISK: Risk level ${(risk * 100).toFixed(0)}% for ${route.platform}`);
  }

  if (route.velocityScore < 0.4) {
    warnings.push(`⚠️ Platform ${route.platform} may be saturated (velocity score: ${route.velocityScore.toFixed(2)})`);
  }

  if (route.trendScore < 0.3) {
    warnings.push(`⚠️ Low trend alignment (${route.trendScore.toFixed(2)}) - content may not resonate`);
  }

  if (route.confidence < 0.5) {
    warnings.push(`⚠️ Low confidence (${route.confidence.toFixed(2)}) - consider alternative platforms`);
  }

  return warnings;
}

function generateRecommendations(route: RouteOption, successProbability: number): string[] {
  const recommendations: string[] = [];

  if (successProbability > 0.8) {
    recommendations.push(`✅ Excellent route - proceed with confidence`);
  } else if (successProbability > 0.6) {
    recommendations.push(`✓ Good route - monitor performance closely`);
  } else {
    recommendations.push(`⚠️ Consider alternative platforms with higher success probability`);
  }

  if (route.trendScore > 0.7) {
    recommendations.push(`🔥 High trend alignment - post soon to capitalize`);
  }

  if (route.visibilityScore > 0.8) {
    recommendations.push(`👁️ Strong visibility potential - optimize thumbnail/title`);
  }

  if (route.velocityScore > 0.8) {
    recommendations.push(`⚡ Optimal timing window - schedule immediately`);
  }

  return recommendations;
}

export async function simulateMultipleRoutes(
  routes: RouteOption[],
  contentId: string
): Promise<SimulationResult[]> {
  return Promise.all(
    routes.map(route => simulateRoute(route, contentId))
  );
}

export function compareSimulations(simulations: SimulationResult[]): SimulationResult {
  // Return simulation with highest success probability
  return simulations.reduce((best, current) => 
    current.successProbability > best.successProbability ? current : best
  );
}
