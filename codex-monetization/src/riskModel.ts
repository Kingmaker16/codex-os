// Codex Monetization Engine v1 - Risk Model

export type RiskType = "trading" | "bankroll" | "ad_fatigue" | "trend" | "platform" | "regulatory";
export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface RiskAssessment {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  score: number; // 0-100
  description: string;
  indicators: string[];
  mitigation: string[];
  timestamp: Date;
}

export class RiskModel {
  private assessments: RiskAssessment[] = [];
  private maxAssessments = 1000;

  /**
   * Assess trading risk
   */
  assessTradingRisk(
    currentPosition: number,
    maxPosition: number,
    winRate: number,
    consecutiveLosses: number
  ): RiskAssessment {
    const indicators: string[] = [];
    let score = 0;

    // Position size risk
    const positionRatio = currentPosition / maxPosition;
    if (positionRatio > 0.8) {
      indicators.push(`Position size at ${(positionRatio * 100).toFixed(0)}% of max`);
      score += 30;
    }

    // Win rate risk
    if (winRate < 0.45) {
      indicators.push(`Low win rate: ${(winRate * 100).toFixed(1)}%`);
      score += 25;
    }

    // Consecutive losses risk
    if (consecutiveLosses >= 3) {
      indicators.push(`${consecutiveLosses} consecutive losses`);
      score += 20 + consecutiveLosses * 5;
    }

    const severity = this.scoreToseverity(score);
    const mitigation = this.getTradingMitigation(severity);

    const assessment: RiskAssessment = {
      id: this.generateId(),
      type: "trading",
      severity,
      score,
      description: `Trading risk: ${indicators.length} warning signs detected`,
      indicators,
      mitigation,
      timestamp: new Date(),
    };

    this.storeAssessment(assessment);
    return assessment;
  }

  /**
   * Assess bankroll risk
   */
  assessBankrollRisk(
    currentBankroll: number,
    initialBankroll: number,
    dailyBurnRate: number
  ): RiskAssessment {
    const indicators: string[] = [];
    let score = 0;

    // Bankroll depletion risk
    const bankrollRatio = currentBankroll / initialBankroll;
    if (bankrollRatio < 0.5) {
      indicators.push(`Bankroll at ${(bankrollRatio * 100).toFixed(0)}% of initial`);
      score += 40;
    }

    // Burn rate risk
    const daysRemaining = dailyBurnRate > 0 ? currentBankroll / dailyBurnRate : Infinity;
    if (daysRemaining < 30 && daysRemaining !== Infinity) {
      indicators.push(`Only ${Math.floor(daysRemaining)} days of runway remaining`);
      score += 35;
    }

    const severity = this.scoreToseverity(score);
    const mitigation = this.getBankrollMitigation(severity);

    const assessment: RiskAssessment = {
      id: this.generateId(),
      type: "bankroll",
      severity,
      score,
      description: `Bankroll risk: ${indicators.length} warning signs detected`,
      indicators,
      mitigation,
      timestamp: new Date(),
    };

    this.storeAssessment(assessment);
    return assessment;
  }

  /**
   * Assess ad fatigue risk
   */
  assessAdFatigueRisk(
    impressions: number,
    ctr: number,
    frequency: number
  ): RiskAssessment {
    const indicators: string[] = [];
    let score = 0;

    // CTR decline risk
    if (ctr < 0.01) {
      indicators.push(`Low CTR: ${(ctr * 100).toFixed(2)}%`);
      score += 25;
    }

    // High frequency risk
    if (frequency > 5) {
      indicators.push(`High frequency: ${frequency.toFixed(1)} impressions per user`);
      score += 30;
    }

    // Impression volume risk
    if (impressions > 1000000) {
      indicators.push(`High impression volume: ${(impressions / 1000000).toFixed(1)}M`);
      score += 15;
    }

    const severity = this.scoreToseverity(score);
    const mitigation = this.getAdFatigueMitigation(severity);

    const assessment: RiskAssessment = {
      id: this.generateId(),
      type: "ad_fatigue",
      severity,
      score,
      description: `Ad fatigue risk: ${indicators.length} warning signs detected`,
      indicators,
      mitigation,
      timestamp: new Date(),
    };

    this.storeAssessment(assessment);
    return assessment;
  }

  /**
   * Assess trend risk (viral content dependency)
   */
  assessTrendRisk(
    trendBasedRevenue: number,
    totalRevenue: number,
    trendAge: number
  ): RiskAssessment {
    const indicators: string[] = [];
    let score = 0;

    // Revenue concentration risk
    const trendRatio = trendBasedRevenue / totalRevenue;
    if (trendRatio > 0.6) {
      indicators.push(`${(trendRatio * 100).toFixed(0)}% revenue from trends`);
      score += 35;
    }

    // Trend age risk
    if (trendAge > 7) {
      indicators.push(`Trend is ${trendAge} days old`);
      score += 25;
    }

    const severity = this.scoreToseverity(score);
    const mitigation = this.getTrendMitigation(severity);

    const assessment: RiskAssessment = {
      id: this.generateId(),
      type: "trend",
      severity,
      score,
      description: `Trend risk: ${indicators.length} warning signs detected`,
      indicators,
      mitigation,
      timestamp: new Date(),
    };

    this.storeAssessment(assessment);
    return assessment;
  }

  /**
   * Get all recent assessments
   */
  getRecentAssessments(limit: number = 10): RiskAssessment[] {
    return this.assessments.slice(-limit);
  }

  /**
   * Get assessments by type
   */
  getAssessmentsByType(type: RiskType): RiskAssessment[] {
    return this.assessments.filter((a) => a.type === type);
  }

  /**
   * Get high-severity assessments
   */
  getCriticalRisks(): RiskAssessment[] {
    return this.assessments.filter((a) => a.severity === "high" || a.severity === "critical");
  }

  /**
   * Convert score to severity
   */
  private scoreToseverity(score: number): RiskSeverity {
    if (score >= 70) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }

  /**
   * Get trading mitigation strategies
   */
  private getTradingMitigation(severity: RiskSeverity): string[] {
    switch (severity) {
      case "critical":
        return ["STOP TRADING IMMEDIATELY", "Review strategy", "Reduce position size by 75%"];
      case "high":
        return ["Reduce position size by 50%", "Tighten stop losses", "Take break from trading"];
      case "medium":
        return ["Monitor closely", "Reduce position size by 25%", "Review recent trades"];
      default:
        return ["Continue monitoring", "Maintain current strategy"];
    }
  }

  /**
   * Get bankroll mitigation strategies
   */
  private getBankrollMitigation(severity: RiskSeverity): string[] {
    switch (severity) {
      case "critical":
        return ["INJECT CAPITAL IMMEDIATELY", "Cut all non-essential costs", "Pause risky ventures"];
      case "high":
        return ["Reduce spending by 50%", "Focus on profitable ventures", "Seek additional funding"];
      case "medium":
        return ["Review expenses", "Optimize cost structure", "Accelerate revenue generation"];
      default:
        return ["Continue monitoring", "Maintain current burn rate"];
    }
  }

  /**
   * Get ad fatigue mitigation strategies
   */
  private getAdFatigueMitigation(severity: RiskSeverity): string[] {
    switch (severity) {
      case "critical":
        return ["PAUSE CAMPAIGNS", "Create new creative", "Expand to new audiences"];
      case "high":
        return ["Rotate creative", "Reduce frequency cap", "Test new ad formats"];
      case "medium":
        return ["Refresh creative", "Monitor performance daily", "Test audience segments"];
      default:
        return ["Continue current campaigns", "Prepare backup creative"];
    }
  }

  /**
   * Get trend mitigation strategies
   */
  private getTrendMitigation(severity: RiskSeverity): string[] {
    switch (severity) {
      case "critical":
        return ["DIVERSIFY IMMEDIATELY", "Launch evergreen content", "Reduce trend dependency"];
      case "high":
        return ["Start evergreen content", "Identify new trends", "Build brand content"];
      case "medium":
        return ["Balance trend vs brand", "Test evergreen content", "Monitor trend lifecycle"];
      default:
        return ["Continue leveraging trends", "Maintain content mix"];
    }
  }

  /**
   * Store assessment
   */
  private storeAssessment(assessment: RiskAssessment): void {
    this.assessments.push(assessment);
    if (this.assessments.length > this.maxAssessments) {
      this.assessments.shift();
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all assessments
   */
  clear(): void {
    this.assessments = [];
  }
}

// Singleton instance
export const riskModel = new RiskModel();
