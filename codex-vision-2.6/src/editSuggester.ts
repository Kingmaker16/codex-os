// editSuggester.ts - Edit Action Suggester

import type { EditSuggestion, EditAction, TimelineAnalysis } from "./types.js";
import { FusionVision } from "./fusionVision.js";

export class EditSuggester {
  private fusionVision = new FusionVision();

  /**
   * Generate comprehensive edit suggestions using multi-LLM fusion
   */
  async suggestEdits(
    timelineAnalysis: TimelineAnalysis,
    platform: string
  ): Promise<EditSuggestion> {
    console.log("[EditSuggester] Generating edit suggestions for", platform);

    // Prepare analysis summary for LLMs
    const analysisSummary = {
      duration: timelineAnalysis.duration,
      hookQuality: timelineAnalysis.hookWindow.quality,
      pacing: timelineAnalysis.pacingAnalysis.actualCutFrequency,
      idealPacing: timelineAnalysis.pacingAnalysis.idealCutFrequency,
      deadFrames: timelineAnalysis.deadFrames.length,
      colorIssues: timelineAnalysis.colorGradingIssues.length,
    };

    // Query all LLMs
    const llmResponses = await this.fusionVision.queryAllLLMs(
      analysisSummary,
      platform
    );

    // Fuse LLM suggestions
    const { actions, consensusScore } = this.fusionVision.fuseEditSuggestions(
      llmResponses,
      platform
    );

    // Add rule-based suggestions
    const ruleBasedActions = this.generateRuleBasedActions(timelineAnalysis);
    const allActions = [...actions, ...ruleBasedActions];

    // Sort by priority and timestamp
    const sortedActions = this.prioritizeActions(allActions);

    // Calculate estimated impact
    const estimatedImpact = this.estimateImpact(
      sortedActions,
      timelineAnalysis
    );

    return {
      videoPath: timelineAnalysis.videoPath,
      platform,
      actions: sortedActions,
      requiresApproval: true, // Co-Pilot mode: ALWAYS requires approval
      estimatedImpact,
      llmResponses,
      consensusScore,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate rule-based edit actions
   */
  private generateRuleBasedActions(
    timeline: TimelineAnalysis
  ): EditAction[] {
    const actions: EditAction[] = [];
    let actionId = 1000;

    // Hook optimization
    if (timeline.hookWindow.quality === "poor") {
      actions.push({
        id: `rule_${actionId++}`,
        type: "jump_zoom",
        timestamp: 0.5,
        duration: 0.3,
        parameters: { scale: 1.2, easing: "ease-out" },
        reason: "Hook: Add dynamic zoom to grab attention",
        confidence: 0.85,
        priority: "critical",
      });

      actions.push({
        id: `rule_${actionId++}`,
        type: "text_overlay",
        timestamp: 1.0,
        duration: 2.0,
        parameters: {
          text: "WATCH THIS",
          position: "top",
          style: "bold",
          color: "#FFFF00",
        },
        reason: "Hook: Strong text overlay needed",
        confidence: 0.9,
        priority: "high",
      });
    }

    // Trim dead frames
    timeline.deadFrames.forEach((timestamp) => {
      actions.push({
        id: `rule_${actionId++}`,
        type: "cut",
        timestamp,
        parameters: { cutLength: 0.5 },
        reason: "Remove low-interest dead frame",
        confidence: 0.75,
        priority: "medium",
      });
    });

    // Fix color issues
    timeline.colorGradingIssues.forEach((issue) => {
      if (issue.issue === "underexposed") {
        actions.push({
          id: `rule_${actionId++}`,
          type: "color_lift",
          timestamp: issue.timestamp,
          parameters: { exposure: 0.7 },
          reason: "Fix underexposure",
          confidence: 0.8,
          priority: issue.severity === "high" ? "high" : "medium",
        });
      }

      if (issue.issue === "low_saturation") {
        actions.push({
          id: `rule_${actionId++}`,
          type: "saturation_bump",
          timestamp: issue.timestamp,
          parameters: { intensity: 1.3 },
          reason: "Boost saturation for visual pop",
          confidence: 0.7,
          priority: "low",
        });
      }
    });

    // Pacing optimization
    if (
      timeline.pacingAnalysis.actualCutFrequency <
      timeline.pacingAnalysis.idealCutFrequency * 0.7
    ) {
      const duration = timeline.duration;
      for (let t = 5; t < duration - 5; t += 3) {
        actions.push({
          id: `rule_${actionId++}`,
          type: "speed_ramp",
          timestamp: t,
          duration: 1.5,
          parameters: { speedMultiplier: 1.2 },
          reason: "Increase pacing with speed ramp",
          confidence: 0.65,
          priority: "low",
        });
      }
    }

    // Zoom to face when detected
    const faceFames = timeline.analyzedFrames.filter(
      (f) => f.faceDetections.length > 0
    );
    faceFames.slice(0, 3).forEach((frame) => {
      actions.push({
        id: `rule_${actionId++}`,
        type: "zoom_to_face",
        timestamp: frame.timestamp,
        duration: 1.0,
        parameters: {
          targetScale: 1.3,
          smooth: true,
        },
        reason: "Focus on face for connection",
        confidence: 0.75,
        priority: "medium",
      });
    });

    return actions;
  }

  /**
   * Prioritize actions by priority and confidence
   */
  private prioritizeActions(actions: EditAction[]): EditAction[] {
    const priorityScores: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return actions.sort((a, b) => {
      const aPriority = priorityScores[a.priority] || 0;
      const bPriority = priorityScores[b.priority] || 0;

      if (aPriority !== bPriority) return bPriority - aPriority;

      if (a.confidence !== b.confidence) return b.confidence - a.confidence;

      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Estimate impact of suggested edits
   */
  private estimateImpact(
    actions: EditAction[],
    timeline: TimelineAnalysis
  ): {
    retentionIncrease: number;
    engagementIncrease: number;
    viralPotential: number;
  } {
    // Base scores
    let retentionIncrease = 0;
    let engagementIncrease = 0;

    // Hook improvements
    const hookActions = actions.filter(
      (a) => a.timestamp <= 3 && a.priority === "critical"
    );
    retentionIncrease += hookActions.length * 8;
    engagementIncrease += hookActions.length * 5;

    // Pacing improvements
    const pacingActions = actions.filter((a) => a.type === "cut" || a.type === "speed_ramp");
    retentionIncrease += pacingActions.length * 3;

    // Visual polish
    const visualActions = actions.filter(
      (a) =>
        a.type === "color_lift" ||
        a.type === "saturation_bump" ||
        a.type === "contrast"
    );
    engagementIncrease += visualActions.length * 2;

    // Cap increases at reasonable values
    retentionIncrease = Math.min(retentionIncrease, 40);
    engagementIncrease = Math.min(engagementIncrease, 35);

    // Viral potential based on hook + pacing + polish
    const hookScore = timeline.hookWindow.quality === "excellent" ? 30 : 15;
    const pacingScore = Math.min(
      (timeline.pacingAnalysis.retentionScore / 100) * 40,
      40
    );
    const polishScore = Math.min(actions.length * 2, 30);

    const viralPotential = Math.round(hookScore + pacingScore + polishScore);

    return {
      retentionIncrease: Math.round(retentionIncrease),
      engagementIncrease: Math.round(engagementIncrease),
      viralPotential: Math.min(viralPotential, 100),
    };
  }
}
