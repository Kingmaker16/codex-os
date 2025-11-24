// Codex Telemetry Engine v1 - Failure Predictor

import type { SystemMetrics } from "./metricsCollector.js";
import type { TelemetryEvent } from "./eventLogger.js";

export interface AnomalyDetection {
  type: "cpu_spike" | "memory_leak" | "disk_full" | "service_down" | "network_issue";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-1
  detectedAt: Date;
  description: string;
  predictedImpact: string;
  recommendation: string;
}

export interface EarlyWarning {
  warningType: "resource_exhaustion" | "service_degradation" | "cascading_failure";
  timeToFailure: number; // minutes
  affectedServices: string[];
  preventionSteps: string[];
  urgency: "low" | "medium" | "high" | "critical";
}

export class FailurePredictor {
  private cpuSpikeThreshold = 90; // Percent
  private memoryLeakThreshold = 85; // Percent
  private diskFullThreshold = 90; // Percent
  private consecutiveHighCpuCount = 0;
  private consecutiveHighMemoryCount = 0;

  /**
   * Detect anomalies from metrics history
   */
  detectAnomalies(history: SystemMetrics[]): AnomalyDetection[] {
    if (history.length === 0) return [];

    const anomalies: AnomalyDetection[] = [];
    const latest = history[history.length - 1];

    // CPU spike detection
    if (latest.cpu.usage > this.cpuSpikeThreshold) {
      this.consecutiveHighCpuCount++;

      if (this.consecutiveHighCpuCount >= 3) {
        anomalies.push({
          type: "cpu_spike",
          severity: this.getSeverityFromValue(latest.cpu.usage, 90, 95, 98),
          confidence: 0.9,
          detectedAt: new Date(),
          description: `CPU usage at ${latest.cpu.usage.toFixed(1)}% for ${this.consecutiveHighCpuCount} consecutive samples`,
          predictedImpact: "Service slowdown, request timeouts, potential crash",
          recommendation: "Identify and kill high CPU processes, scale horizontally",
        });
      }
    } else {
      this.consecutiveHighCpuCount = 0;
    }

    // Memory leak detection
    if (latest.memory.usagePercent > this.memoryLeakThreshold) {
      this.consecutiveHighMemoryCount++;

      // Check if memory is steadily increasing
      const isIncreasing = this.isMetricIncreasing(
        history.slice(-10).map((m) => m.memory.usagePercent)
      );

      if (this.consecutiveHighMemoryCount >= 5 && isIncreasing) {
        anomalies.push({
          type: "memory_leak",
          severity: this.getSeverityFromValue(latest.memory.usagePercent, 85, 90, 95),
          confidence: isIncreasing ? 0.85 : 0.6,
          detectedAt: new Date(),
          description: `Memory usage at ${latest.memory.usagePercent.toFixed(1)}% and increasing`,
          predictedImpact: "OOM kill imminent, system freeze, data loss",
          recommendation: "Restart services with memory leaks, investigate root cause",
        });
      }
    } else {
      this.consecutiveHighMemoryCount = 0;
    }

    // Disk full detection
    if (latest.disk.usagePercent > this.diskFullThreshold) {
      anomalies.push({
        type: "disk_full",
        severity: this.getSeverityFromValue(latest.disk.usagePercent, 90, 95, 98),
        confidence: 0.95,
        detectedAt: new Date(),
        description: `Disk usage at ${latest.disk.usagePercent.toFixed(1)}%`,
        predictedImpact: "Cannot write logs, database corruption, service failure",
        recommendation: "Clear logs, remove temp files, expand storage",
      });
    }

    return anomalies;
  }

  /**
   * Generate early warnings based on trends
   */
  generateEarlyWarnings(
    history: SystemMetrics[],
    events: TelemetryEvent[]
  ): EarlyWarning[] {
    if (history.length < 10) return [];

    const warnings: EarlyWarning[] = [];

    // Predict resource exhaustion
    const memoryTrend = history.slice(-20).map((m) => m.memory.usagePercent);
    const diskTrend = history.slice(-20).map((m) => m.disk.usagePercent);

    // Memory exhaustion prediction
    if (this.isMetricIncreasing(memoryTrend)) {
      const rate = this.calculateGrowthRate(memoryTrend);
      const current = memoryTrend[memoryTrend.length - 1];
      const timeToFailure = this.predictTimeToThreshold(current, 95, rate);

      if (timeToFailure < 60 && timeToFailure > 0) {
        warnings.push({
          warningType: "resource_exhaustion",
          timeToFailure,
          affectedServices: ["all"],
          preventionSteps: [
            "Restart high-memory services",
            "Clear caches",
            "Scale up if possible",
          ],
          urgency: timeToFailure < 15 ? "critical" : timeToFailure < 30 ? "high" : "medium",
        });
      }
    }

    // Disk exhaustion prediction
    if (this.isMetricIncreasing(diskTrend)) {
      const rate = this.calculateGrowthRate(diskTrend);
      const current = diskTrend[diskTrend.length - 1];
      const timeToFailure = this.predictTimeToThreshold(current, 95, rate);

      if (timeToFailure < 120 && timeToFailure > 0) {
        warnings.push({
          warningType: "resource_exhaustion",
          timeToFailure,
          affectedServices: ["database", "logs", "brain"],
          preventionSteps: [
            "Archive old logs",
            "Compress backups",
            "Move data to external storage",
          ],
          urgency: timeToFailure < 30 ? "critical" : timeToFailure < 60 ? "high" : "medium",
        });
      }
    }

    // Service degradation detection from events
    const recentErrors = events.filter(
      (e) => e.level === "error" || e.level === "critical"
    ).slice(-20);

    if (recentErrors.length > 10) {
      warnings.push({
        warningType: "service_degradation",
        timeToFailure: 10,
        affectedServices: [...new Set(recentErrors.map((e) => e.source))],
        preventionSteps: [
          "Check service health",
          "Review error logs",
          "Restart failing services",
        ],
        urgency: "high",
      });
    }

    return warnings;
  }

  /**
   * Check if metric is consistently increasing
   */
  private isMetricIncreasing(values: number[]): boolean {
    if (values.length < 3) return false;

    let increasingCount = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) {
        increasingCount++;
      }
    }

    return increasingCount / (values.length - 1) > 0.6; // 60% of samples increasing
  }

  /**
   * Calculate growth rate per sample
   */
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];
    const samples = values.length - 1;

    return (last - first) / samples;
  }

  /**
   * Predict time to reach threshold (in minutes)
   */
  private predictTimeToThreshold(current: number, threshold: number, rate: number): number {
    if (rate <= 0) return -1; // Not growing

    const remaining = threshold - current;
    const samplesNeeded = remaining / rate;

    // Assume 1 sample per minute (adjust based on actual collection rate)
    return Math.round(samplesNeeded);
  }

  /**
   * Get severity from value and thresholds
   */
  private getSeverityFromValue(
    value: number,
    low: number,
    medium: number,
    high: number
  ): "low" | "medium" | "high" | "critical" {
    if (value >= high) return "critical";
    if (value >= medium) return "high";
    if (value >= low) return "medium";
    return "low";
  }

  /**
   * Reset internal counters
   */
  reset(): void {
    this.consecutiveHighCpuCount = 0;
    this.consecutiveHighMemoryCount = 0;
  }
}

// Singleton instance
export const failurePredictor = new FailurePredictor();
