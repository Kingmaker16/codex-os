// Codex Telemetry Engine v1 - Metrics Collector

import * as os from "node:os";
import { execSync } from "node:child_process";

export interface SystemMetrics {
  timestamp: Date;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}

export interface CpuMetrics {
  usage: number; // Percentage
  loadAverage: number[];
  cores: number;
}

export interface MemoryMetrics {
  total: number; // Bytes
  used: number;
  free: number;
  usagePercent: number;
}

export interface DiskMetrics {
  total: number; // Bytes
  used: number;
  free: number;
  usagePercent: number;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  timestamp: Date;
}

export interface ServiceLatency {
  serviceName: string;
  port: number;
  latency: number; // milliseconds
  status: "healthy" | "slow" | "down";
  lastCheck: Date;
}

export class MetricsCollector {
  private networkBaseline: NetworkMetrics | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private maxHistorySize = 1000; // Keep last 1000 samples

  constructor() {
    this.initializeNetworkBaseline();
  }

  /**
   * Collect all system metrics
   */
  async collect(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: this.collectCpuMetrics(),
      memory: this.collectMemoryMetrics(),
      disk: await this.collectDiskMetrics(),
      network: this.collectNetworkMetrics(),
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Collect CPU metrics
   */
  private collectCpuMetrics(): CpuMetrics {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    // Calculate CPU usage from idle time
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;

    return {
      usage: Math.round(usage * 100) / 100,
      loadAverage: loadAvg,
      cores: cpus.length,
    };
  }

  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): MemoryMetrics {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;

    return {
      total,
      used,
      free,
      usagePercent: Math.round(usagePercent * 100) / 100,
    };
  }

  /**
   * Collect disk metrics
   */
  private async collectDiskMetrics(): Promise<DiskMetrics> {
    try {
      // Use df command to get disk usage
      const output = execSync("df -k / | tail -1").toString();
      const parts = output.trim().split(/\s+/);

      const total = parseInt(parts[1]) * 1024; // Convert KB to bytes
      const used = parseInt(parts[2]) * 1024;
      const free = parseInt(parts[3]) * 1024;
      const usagePercent = parseFloat(parts[4].replace("%", ""));

      return {
        total,
        used,
        free,
        usagePercent,
      };
    } catch (err) {
      console.error("Failed to collect disk metrics:", err);
      return {
        total: 0,
        used: 0,
        free: 0,
        usagePercent: 0,
      };
    }
  }

  /**
   * Collect network metrics
   */
  private collectNetworkMetrics(): NetworkMetrics {
    try {
      // On macOS, use netstat to get network stats
      const output = execSync("netstat -ibn | grep -v Name | head -2").toString();
      
      let bytesReceived = 0;
      let bytesSent = 0;

      output.split("\n").forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 10) {
          bytesReceived += parseInt(parts[6]) || 0;
          bytesSent += parseInt(parts[9]) || 0;
        }
      });

      return {
        bytesReceived,
        bytesSent,
        timestamp: new Date(),
      };
    } catch (err) {
      console.error("Failed to collect network metrics:", err);
      return {
        bytesReceived: 0,
        bytesSent: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Initialize network baseline for delta calculations
   */
  private initializeNetworkBaseline(): void {
    this.networkBaseline = this.collectNetworkMetrics();
  }

  /**
   * Check service latency
   */
  async checkServiceLatency(serviceName: string, port: number): Promise<ServiceLatency> {
    const startTime = Date.now();
    let status: "healthy" | "slow" | "down" = "down";

    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        if (latency < 100) {
          status = "healthy";
        } else if (latency < 1000) {
          status = "slow";
        } else {
          status = "down";
        }
      }

      return {
        serviceName,
        port,
        latency,
        status,
        lastCheck: new Date(),
      };
    } catch (err) {
      return {
        serviceName,
        port,
        latency: Date.now() - startTime,
        status: "down",
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Get metrics history
   */
  getHistory(samples?: number): SystemMetrics[] {
    if (samples) {
      return this.metricsHistory.slice(-samples);
    }
    return [...this.metricsHistory];
  }

  /**
   * Get latest metrics
   */
  getLatest(): SystemMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.metricsHistory = [];
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
