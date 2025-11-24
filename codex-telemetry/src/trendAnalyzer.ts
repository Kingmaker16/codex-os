// Codex Telemetry Engine v1 - Trend Analyzer

import type { SystemMetrics } from "./metricsCollector.js";

export interface TrendReport {
  metric: string;
  current: number;
  average: number;
  min: number;
  max: number;
  trend: "improving" | "stable" | "degrading";
  percentChange: number;
  analysis: string;
}

export interface PerformanceRegression {
  metric: string;
  severity: "low" | "medium" | "high" | "critical";
  currentValue: number;
  baselineValue: number;
  percentDegradation: number;
  detectedAt: Date;
  recommendation: string;
}

export class TrendAnalyzer {
  private regressionThreshold = 15; // Percent degradation to flag as regression

  /**
   * Analyze CPU trends
   */
  analyzeCpuTrend(history: SystemMetrics[]): TrendReport {
    if (history.length === 0) {
      return this.emptyTrendReport("cpu");
    }

    const values = history.map((m) => m.cpu.usage);
    const current = values[values.length - 1];
    const average = this.calculateAverage(values);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Compare recent vs older samples
    const recentAvg = this.calculateAverage(values.slice(-10));
    const olderAvg = this.calculateAverage(values.slice(0, 10));
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trend: "improving" | "stable" | "degrading" = "stable";
    let analysis = "";

    if (percentChange > 10) {
      trend = "degrading";
      analysis = `CPU usage increased by ${percentChange.toFixed(1)}% compared to baseline`;
    } else if (percentChange < -10) {
      trend = "improving";
      analysis = `CPU usage decreased by ${Math.abs(percentChange).toFixed(1)}% compared to baseline`;
    } else {
      analysis = "CPU usage is stable";
    }

    return {
      metric: "cpu",
      current,
      average,
      min,
      max,
      trend,
      percentChange,
      analysis,
    };
  }

  /**
   * Analyze memory trends
   */
  analyzeMemoryTrend(history: SystemMetrics[]): TrendReport {
    if (history.length === 0) {
      return this.emptyTrendReport("memory");
    }

    const values = history.map((m) => m.memory.usagePercent);
    const current = values[values.length - 1];
    const average = this.calculateAverage(values);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const recentAvg = this.calculateAverage(values.slice(-10));
    const olderAvg = this.calculateAverage(values.slice(0, 10));
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trend: "improving" | "stable" | "degrading" = "stable";
    let analysis = "";

    if (percentChange > 10) {
      trend = "degrading";
      analysis = `Memory usage increased by ${percentChange.toFixed(1)}% - possible memory leak`;
    } else if (percentChange < -10) {
      trend = "improving";
      analysis = `Memory usage decreased by ${Math.abs(percentChange).toFixed(1)}%`;
    } else {
      analysis = "Memory usage is stable";
    }

    return {
      metric: "memory",
      current,
      average,
      min,
      max,
      trend,
      percentChange,
      analysis,
    };
  }

  /**
   * Analyze disk trends
   */
  analyzeDiskTrend(history: SystemMetrics[]): TrendReport {
    if (history.length === 0) {
      return this.emptyTrendReport("disk");
    }

    const values = history.map((m) => m.disk.usagePercent);
    const current = values[values.length - 1];
    const average = this.calculateAverage(values);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const recentAvg = this.calculateAverage(values.slice(-10));
    const olderAvg = this.calculateAverage(values.slice(0, 10));
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trend: "improving" | "stable" | "degrading" = "stable";
    let analysis = "";

    if (percentChange > 5) {
      trend = "degrading";
      analysis = `Disk usage increased by ${percentChange.toFixed(1)}% - consider cleanup`;
    } else if (percentChange < -5) {
      trend = "improving";
      analysis = `Disk usage decreased by ${Math.abs(percentChange).toFixed(1)}%`;
    } else {
      analysis = "Disk usage is stable";
    }

    return {
      metric: "disk",
      current,
      average,
      min,
      max,
      trend,
      percentChange,
      analysis,
    };
  }

  /**
   * Detect performance regressions
   */
  detectRegressions(history: SystemMetrics[]): PerformanceRegression[] {
    if (history.length < 20) {
      return []; // Need sufficient data
    }

    const regressions: PerformanceRegression[] = [];

    // Check CPU regression
    const cpuCurrent = history[history.length - 1].cpu.usage;
    const cpuBaseline = this.calculateAverage(history.slice(0, 10).map((m) => m.cpu.usage));
    const cpuDegradation = ((cpuCurrent - cpuBaseline) / cpuBaseline) * 100;

    if (cpuDegradation > this.regressionThreshold) {
      regressions.push({
        metric: "CPU Usage",
        severity: this.calculateSeverity(cpuDegradation),
        currentValue: cpuCurrent,
        baselineValue: cpuBaseline,
        percentDegradation: cpuDegradation,
        detectedAt: new Date(),
        recommendation: "Investigate high CPU processes, consider optimization",
      });
    }

    // Check memory regression
    const memCurrent = history[history.length - 1].memory.usagePercent;
    const memBaseline = this.calculateAverage(history.slice(0, 10).map((m) => m.memory.usagePercent));
    const memDegradation = ((memCurrent - memBaseline) / memBaseline) * 100;

    if (memDegradation > this.regressionThreshold) {
      regressions.push({
        metric: "Memory Usage",
        severity: this.calculateSeverity(memDegradation),
        currentValue: memCurrent,
        baselineValue: memBaseline,
        percentDegradation: memDegradation,
        detectedAt: new Date(),
        recommendation: "Check for memory leaks, restart services if needed",
      });
    }

    return regressions;
  }

  /**
   * Calculate average of values
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculate severity based on degradation percentage
   */
  private calculateSeverity(percentDegradation: number): "low" | "medium" | "high" | "critical" {
    if (percentDegradation > 50) return "critical";
    if (percentDegradation > 35) return "high";
    if (percentDegradation > 20) return "medium";
    return "low";
  }

  /**
   * Empty trend report for when no data is available
   */
  private emptyTrendReport(metric: string): TrendReport {
    return {
      metric,
      current: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: "stable",
      percentChange: 0,
      analysis: "Insufficient data for trend analysis",
    };
  }

  /**
   * Generate comprehensive trend report
   */
  generateReport(history: SystemMetrics[]): {
    cpu: TrendReport;
    memory: TrendReport;
    disk: TrendReport;
    regressions: PerformanceRegression[];
    timestamp: Date;
  } {
    return {
      cpu: this.analyzeCpuTrend(history),
      memory: this.analyzeMemoryTrend(history),
      disk: this.analyzeDiskTrend(history),
      regressions: this.detectRegressions(history),
      timestamp: new Date(),
    };
  }
}

// Singleton instance
export const trendAnalyzer = new TrendAnalyzer();
