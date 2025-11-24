// shotPlanner.ts - Viral Pacing Engine

import type { PacingPlan, PacingSegment, SceneAnalysis } from "./types.js";

export class ShotPlanner {
  /**
   * Generate optimal shot plan for viral content
   * Uses scene analysis to plan cuts, transitions, and pacing
   */
  generateShotPlan(
    sceneAnalysis: SceneAnalysis,
    platform: string,
    objective: string = "viral"
  ): PacingPlan {
    console.log(`[ShotPlanner] Generating shot plan for ${platform} (${objective})`);

    const targetDuration = this.getTargetDuration(platform);
    const segments = this.planSegments(sceneAnalysis, targetDuration, objective);
    const hookWindow = { start: 0, end: 3 };
    const peakMoment = this.identifyPeakMoment(sceneAnalysis, targetDuration);
    const ctaWindow = {
      start: targetDuration - 5,
      end: targetDuration,
    };

    const plan: PacingPlan = {
      totalDuration: targetDuration,
      segments,
      hookWindow,
      peakMoment,
      ctaWindow,
    };

    console.log(`[ShotPlanner] Plan generated with ${segments.length} segments`);
    return plan;
  }

  /**
   * Get target duration for platform
   */
  private getTargetDuration(platform: string): number {
    const durations: Record<string, number> = {
      tiktok: 60,
      reels: 90,
      shorts: 60,
      youtube: 180,
    };

    return durations[platform] || 60;
  }

  /**
   * Plan pacing segments based on scene analysis
   */
  private planSegments(
    analysis: SceneAnalysis,
    targetDuration: number,
    objective: string
  ): PacingSegment[] {
    const segments: PacingSegment[] = [];

    // Hook segment (0-3s): Highest intensity
    segments.push({
      start: 0,
      end: 3,
      type: "hook",
      intensity: 1.0,
      cutFrequency: this.calculateCutFrequency("hook", objective, analysis.motionIntensity),
    });

    // Build segment (3s - 25% of video)
    const buildEnd = targetDuration * 0.25;
    segments.push({
      start: 3,
      end: buildEnd,
      type: "build",
      intensity: 0.7,
      cutFrequency: this.calculateCutFrequency("build", objective, analysis.motionIntensity),
    });

    // Peak segment (25% - 60% of video)
    const peakEnd = targetDuration * 0.6;
    segments.push({
      start: buildEnd,
      end: peakEnd,
      type: "peak",
      intensity: 0.9,
      cutFrequency: this.calculateCutFrequency("peak", objective, analysis.motionIntensity),
    });

    // Resolve segment (60% - last 5s)
    const resolveEnd = targetDuration - 5;
    segments.push({
      start: peakEnd,
      end: resolveEnd,
      type: "resolve",
      intensity: 0.6,
      cutFrequency: this.calculateCutFrequency(
        "resolve",
        objective,
        analysis.motionIntensity
      ),
    });

    // CTA segment (last 5s)
    segments.push({
      start: resolveEnd,
      end: targetDuration,
      type: "cta",
      intensity: 0.8,
      cutFrequency: this.calculateCutFrequency("cta", objective, analysis.motionIntensity),
    });

    return segments;
  }

  /**
   * Calculate cut frequency for segment
   */
  private calculateCutFrequency(
    segmentType: string,
    objective: string,
    baseMotionIntensity: number
  ): number {
    const baseFrequencies: Record<string, number> = {
      hook: 2.5, // 2.5 cuts per second (very fast)
      build: 1.0, // 1 cut per second
      peak: 1.5, // 1.5 cuts per second
      resolve: 0.5, // 0.5 cuts per second (slow down)
      cta: 0.3, // 0.3 cuts per second (let CTA breathe)
    };

    let frequency = baseFrequencies[segmentType] || 1.0;

    // Adjust based on objective
    if (objective === "viral") {
      frequency *= 1.2; // Faster cuts for viral content
    } else if (objective === "brand") {
      frequency *= 0.8; // Slower, more cinematic cuts
    }

    // Adjust based on video motion intensity
    frequency *= 0.8 + baseMotionIntensity * 0.4; // 0.8x to 1.2x

    return Math.round(frequency * 10) / 10;
  }

  /**
   * Identify peak moment in video
   */
  private identifyPeakMoment(analysis: SceneAnalysis, duration: number): number {
    // Peak should be around 40% through video
    const targetPeak = duration * 0.4;

    // Find scene near target with highest complexity
    const nearbyScenes = analysis.scenes.filter(
      (s) => Math.abs(s.start - targetPeak) < duration * 0.15
    );

    if (nearbyScenes.length === 0) return targetPeak;

    const peakScene = nearbyScenes.sort((a, b) => b.complexity - a.complexity)[0];
    return peakScene.start + (peakScene.end - peakScene.start) / 2;
  }

  /**
   * Optimize existing pacing plan based on platform best practices
   */
  optimizePacing(plan: PacingPlan, platform: string): PacingPlan {
    const optimized = { ...plan };

    // Platform-specific optimizations
    if (platform === "tiktok") {
      // TikTok: Fast-paced, hook within 1s
      optimized.hookWindow = { start: 0, end: 1.5 };
      optimized.segments = optimized.segments.map((seg) => {
        if (seg.type === "hook") {
          return { ...seg, cutFrequency: Math.max(seg.cutFrequency || 2, 3.0) };
        }
        return seg;
      });
    } else if (platform === "youtube") {
      // YouTube: Slower pacing, more cinematic
      optimized.segments = optimized.segments.map((seg) => ({
        ...seg,
        cutFrequency: (seg.cutFrequency || 1) * 0.7,
      }));
    } else if (platform === "reels") {
      // Reels: Medium pacing, strong visual hooks
      optimized.hookWindow = { start: 0, end: 2.5 };
    }

    return optimized;
  }

  /**
   * Generate cut suggestions based on pacing plan
   */
  generateCutSuggestions(plan: PacingPlan, sceneAnalysis: SceneAnalysis): number[] {
    const cuts: number[] = [];

    for (const segment of plan.segments) {
      const segmentDuration = segment.end - segment.start;
      const numCuts = Math.floor(segmentDuration * (segment.cutFrequency || 1));

      for (let i = 1; i <= numCuts; i++) {
        const cutTime = segment.start + (segmentDuration / (numCuts + 1)) * i;
        cuts.push(Math.round(cutTime * 10) / 10); // Round to 1 decimal
      }
    }

    // Align cuts with scene boundaries when possible
    const alignedCuts = cuts.map((cut) => {
      const nearestScene = sceneAnalysis.scenes.find(
        (s) => Math.abs(s.start - cut) < 0.5 || Math.abs(s.end - cut) < 0.5
      );

      if (nearestScene) {
        return Math.abs(nearestScene.start - cut) < Math.abs(nearestScene.end - cut)
          ? nearestScene.start
          : nearestScene.end;
      }

      return cut;
    });

    return [...new Set(alignedCuts)].sort((a, b) => a - b);
  }

  /**
   * Suggest B-roll insertion points
   */
  suggestBRollPoints(plan: PacingPlan, count: number = 3): number[] {
    const bRollPoints: number[] = [];

    // Add B-roll during build and resolve segments (not hook or peak)
    const suitableSegments = plan.segments.filter(
      (s) => s.type === "build" || s.type === "resolve"
    );

    for (const segment of suitableSegments) {
      const segmentMidpoint = segment.start + (segment.end - segment.start) / 2;
      bRollPoints.push(segmentMidpoint);

      if (bRollPoints.length >= count) break;
    }

    return bRollPoints.slice(0, count);
  }

  /**
   * Suggest text overlay timing
   */
  suggestTextOverlays(plan: PacingPlan): Array<{ text: string; timestamp: number }> {
    const overlays: Array<{ text: string; timestamp: number }> = [];

    // Hook text (1-2s)
    overlays.push({
      text: "WATCH THIS",
      timestamp: 1.0,
    });

    // Peak moment text
    overlays.push({
      text: "THIS IS INSANE",
      timestamp: plan.peakMoment,
    });

    // CTA text
    overlays.push({
      text: "FOLLOW FOR MORE",
      timestamp: plan.ctaWindow.start + 1,
    });

    return overlays;
  }

  /**
   * Calculate retention score for pacing plan
   */
  calculateRetentionScore(plan: PacingPlan): number {
    let score = 50; // Base score

    // Hook intensity bonus
    const hookSegment = plan.segments.find((s) => s.type === "hook");
    if (hookSegment && hookSegment.intensity >= 0.9) score += 20;

    // Cut frequency bonus (faster cuts = higher retention)
    const avgCutFrequency =
      plan.segments.reduce((sum, s) => sum + (s.cutFrequency || 0), 0) /
      plan.segments.length;
    score += avgCutFrequency * 10;

    // Peak placement bonus (optimal at 35-45%)
    const peakPercentage = plan.peakMoment / plan.totalDuration;
    if (peakPercentage >= 0.35 && peakPercentage <= 0.45) score += 15;

    // CTA window bonus
    if (plan.ctaWindow.end - plan.ctaWindow.start <= 5) score += 5;

    return Math.min(100, Math.round(score));
  }
}
