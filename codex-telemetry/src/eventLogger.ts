// Codex Telemetry Engine v1 - Event Logger

import fetch from "node-fetch";

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";
export type EventCategory = "system" | "service" | "network" | "security" | "performance";

export interface TelemetryEvent {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: EventCategory;
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export class EventLogger {
  private events: TelemetryEvent[] = [];
  private maxEventHistory = 10000;
  private brainUrl = "http://localhost:4100";
  private sessionId = "codex-telemetry";

  /**
   * Log a telemetry event
   */
  async log(
    level: LogLevel,
    category: EventCategory,
    source: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<TelemetryEvent> {
    const event: TelemetryEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      level,
      category,
      source,
      message,
      metadata,
    };

    // Store locally
    this.events.push(event);
    if (this.events.length > this.maxEventHistory) {
      this.events.shift();
    }

    // Log to Brain (non-blocking)
    this.logToBrain(event).catch((err) => {
      console.error("Failed to log to Brain:", err);
    });

    return event;
  }

  /**
   * Log to Brain service
   */
  private async logToBrain(event: TelemetryEvent): Promise<void> {
    try {
      const payload = {
        sessionId: this.sessionId,
        agentName: "telemetry",
        modelName: "system",
        userMessage: `[${event.level.toUpperCase()}] ${event.category}: ${event.message}`,
        agentResponse: JSON.stringify(event.metadata || {}),
        metadata: {
          eventId: event.id,
          level: event.level,
          category: event.category,
          source: event.source,
          timestamp: event.timestamp.toISOString(),
        },
      };

      await fetch(`${this.brainUrl}/brain/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      // Silent fail - don't disrupt telemetry if Brain is down
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `telem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Query events by filter
   */
  query(filter?: {
    level?: LogLevel;
    category?: EventCategory;
    source?: string;
    since?: Date;
    limit?: number;
  }): TelemetryEvent[] {
    let filtered = [...this.events];

    if (filter?.level) {
      filtered = filtered.filter((e) => e.level === filter.level);
    }

    if (filter?.category) {
      filtered = filtered.filter((e) => e.category === filter.category);
    }

    if (filter?.source) {
      filtered = filtered.filter((e) => e.source === filter.source);
    }

    if (filter?.since) {
      filtered = filtered.filter((e) => e.timestamp >= filter.since!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * Get event count by level
   */
  getCountByLevel(): Record<LogLevel, number> {
    const counts: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    };

    this.events.forEach((event) => {
      counts[event.level]++;
    });

    return counts;
  }

  /**
   * Get event count by category
   */
  getCountByCategory(): Record<EventCategory, number> {
    const counts: Record<EventCategory, number> = {
      system: 0,
      service: 0,
      network: 0,
      security: 0,
      performance: 0,
    };

    this.events.forEach((event) => {
      counts[event.category]++;
    });

    return counts;
  }

  /**
   * Get recent events
   */
  getRecent(count: number = 100): TelemetryEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.events = [];
  }

  /**
   * Get total event count
   */
  getTotalCount(): number {
    return this.events.length;
  }
}

// Singleton instance
export const eventLogger = new EventLogger();
