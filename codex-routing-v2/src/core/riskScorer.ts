// Content Routing Engine v2 ULTRA - Risk Scorer

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { Platform, Content, RiskLevel } from '../types.js';

export async function scoreRisk(content: Content, platform: Platform, accountId?: string): Promise<number> {
  try {
    // Get account risk from Accounts service
    let accountRisk = 0.3; // Default medium-low risk
    if (accountId) {
      const accountResponse = await axios.get(`${CONFIG.SERVICES.ACCOUNTS}/accounts/${accountId}`, {
        timeout: 2000
      });
      accountRisk = accountResponse.data.riskScore || 0.3;
    }

    // Get platform-specific risk
    const platformConfig = CONFIG.PLATFORMS[platform];
    const platformRisk = 1 - (platformConfig?.maxRisk || 0.5);

    // Content risk assessment (simplified)
    const contentRisk = assessContentRisk(content);

    // Weighted combination (lower is safer)
    const totalRisk = (accountRisk * 0.4) + (platformRisk * 0.3) + (contentRisk * 0.3);
    
    // Convert to safety score (inverse of risk)
    return 1 - Math.max(0, Math.min(1, totalRisk));
  } catch (error) {
    console.warn(`[RiskScorer] Failed to score risk for ${platform}:`, error);
    return 0.6; // Conservative score on failure
  }
}

function assessContentRisk(content: Content): number {
  // Simplified content risk assessment
  // In production, this would use NLP/ML models
  let risk = 0.2; // Base low risk

  // Check content length (too short or too long = higher risk)
  if (content.duration) {
    if (content.duration < 10 || content.duration > 3600) {
      risk += 0.1;
    }
  }

  // Check metadata for risk signals
  if (content.metadata) {
    const sensitiveKeywords = ['political', 'controversial', 'explicit'];
    const hasRiskyKeywords = Object.values(content.metadata).some(value =>
      sensitiveKeywords.some(keyword => 
        String(value).toLowerCase().includes(keyword)
      )
    );
    if (hasRiskyKeywords) {
      risk += 0.3;
    }
  }

  return Math.min(1, risk);
}

export function categorizeRisk(riskScore: number): RiskLevel {
  if (riskScore >= 0.8) return 'LOW';
  if (riskScore >= 0.6) return 'MEDIUM';
  if (riskScore >= 0.4) return 'HIGH';
  return 'CRITICAL';
}

export function shouldAllowRoute(riskScore: number, platform: Platform): boolean {
  const platformConfig = CONFIG.PLATFORMS[platform];
  const safetyScore = riskScore; // Higher score = safer
  const requiredSafety = platformConfig?.maxRisk || 0.5;
  
  // Allow if risk is below platform threshold
  return (1 - safetyScore) <= requiredSafety;
}
