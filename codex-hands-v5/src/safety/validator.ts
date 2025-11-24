// =============================================
// SAFETY ENGINE v2 PATCHES
// =============================================

import { ActionType, RiskAssessment, SafetyConfig, SAFE_ROOT } from "../types.js";

const DEFAULT_CONFIG: SafetyConfig = {
  domainWhitelist: [
    "tiktok.com",
    "youtube.com",
    "instagram.com",
    "shopify.com",
    "amazon.com",
    "etsy.com"
  ],
  appWhitelist: [
    "Adobe Premiere Pro",
    "Final Cut Pro",
    "CapCut",
    "Safari",
    "Chrome",
    "Firefox"
  ],
  forbiddenActions: [],
  maxRetries: 3
};

export class SafetyValidator {
  private config: SafetyConfig;

  constructor(config?: Partial<SafetyConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  validatePath(path: string): boolean {
    return path.startsWith(SAFE_ROOT);
  }

  validateDomain(url: string): boolean {
    try {
      const domain = new URL(url).hostname;
      return this.config.domainWhitelist.some(allowed => 
        domain.includes(allowed)
      );
    } catch {
      return false;
    }
  }

  validateApp(appName: string): boolean {
    return this.config.appWhitelist.includes(appName);
  }

  validateAction(actionType: ActionType, params: any): RiskAssessment {
    const violations: string[] = [];
    let score = 0;

    // Check for forbidden actions
    if (this.config.forbiddenActions.includes(actionType)) {
      violations.push(`Action type ${actionType} is forbidden`);
      score += 50;
    }

    // Validate file paths
    if (params.path && !this.validatePath(params.path)) {
      violations.push(`Path ${params.path} is outside safe root`);
      score += 30;
    }

    // Validate URLs
    if (params.url && !this.validateDomain(params.url)) {
      violations.push(`Domain not whitelisted: ${params.url}`);
      score += 20;
    }

    // Validate app names
    if (params.appName && !this.validateApp(params.appName)) {
      violations.push(`App not whitelisted: ${params.appName}`);
      score += 15;
    }

    // Risk level classification
    let level: RiskAssessment["level"];
    if (score >= 50) level = "CRITICAL";
    else if (score >= 30) level = "HIGH";
    else if (score >= 15) level = "MEDIUM";
    else level = "LOW";

    return {
      score,
      level,
      violations,
      allowed: level !== "CRITICAL"
    };
  }

  assessChainRisk(actions: Array<{ actionType: ActionType; params: any }>): RiskAssessment {
    let totalScore = 0;
    const allViolations: string[] = [];

    for (const action of actions) {
      const assessment = this.validateAction(action.actionType, action.params);
      totalScore += assessment.score;
      allViolations.push(...assessment.violations);
    }

    const avgScore = totalScore / actions.length;

    let level: RiskAssessment["level"];
    if (avgScore >= 50) level = "CRITICAL";
    else if (avgScore >= 30) level = "HIGH";
    else if (avgScore >= 15) level = "MEDIUM";
    else level = "LOW";

    return {
      score: avgScore,
      level,
      violations: allViolations,
      allowed: level !== "CRITICAL"
    };
  }
}

export const safetyValidator = new SafetyValidator();
