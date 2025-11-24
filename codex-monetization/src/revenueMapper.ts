// Codex Monetization Engine v1 - Revenue Mapper

import type { RevenueEntry, RevenueVertical } from "./revenueCollector.js";

export interface RevenueMapping {
  contentId: string;
  contentType: "video" | "post" | "story" | "reel" | "product" | "trade" | "game";
  platform: string;
  vertical: RevenueVertical;
  totalRevenue: number;
  impressions?: number;
  engagement?: number;
  rpm?: number; // Revenue per 1000 impressions
  action: "scale" | "optimize" | "pause" | "duplicate" | "monitor";
  actionReason: string;
  timestamp: Date;
}

export class RevenueMapper {
  private mappings: Map<string, RevenueMapping> = new Map();

  /**
   * Map content to revenue and determine action
   */
  mapContent(
    contentId: string,
    contentType: RevenueMapping["contentType"],
    platform: string,
    vertical: RevenueVertical,
    revenue: number,
    impressions?: number,
    engagement?: number
  ): RevenueMapping {
    const rpm = impressions ? (revenue / impressions) * 1000 : undefined;

    // Determine action based on performance
    const { action, reason } = this.determineAction(revenue, rpm, engagement);

    const mapping: RevenueMapping = {
      contentId,
      contentType,
      platform,
      vertical,
      totalRevenue: revenue,
      impressions,
      engagement,
      rpm,
      action,
      actionReason: reason,
      timestamp: new Date(),
    };

    this.mappings.set(contentId, mapping);
    return mapping;
  }

  /**
   * Update existing mapping with new revenue data
   */
  updateMapping(contentId: string, additionalRevenue: number): RevenueMapping | null {
    const existing = this.mappings.get(contentId);
    if (!existing) return null;

    const updated: RevenueMapping = {
      ...existing,
      totalRevenue: existing.totalRevenue + additionalRevenue,
      rpm: existing.impressions
        ? ((existing.totalRevenue + additionalRevenue) / existing.impressions) * 1000
        : undefined,
      timestamp: new Date(),
    };

    // Re-determine action
    const { action, reason } = this.determineAction(
      updated.totalRevenue,
      updated.rpm,
      updated.engagement
    );
    updated.action = action;
    updated.actionReason = reason;

    this.mappings.set(contentId, updated);
    return updated;
  }

  /**
   * Get mapping by content ID
   */
  getMapping(contentId: string): RevenueMapping | undefined {
    return this.mappings.get(contentId);
  }

  /**
   * Get mappings by action
   */
  getMappingsByAction(
    action: RevenueMapping["action"]
  ): RevenueMapping[] {
    return Array.from(this.mappings.values()).filter((m) => m.action === action);
  }

  /**
   * Get mappings by platform
   */
  getMappingsByPlatform(platform: string): RevenueMapping[] {
    return Array.from(this.mappings.values()).filter(
      (m) => m.platform.toLowerCase() === platform.toLowerCase()
    );
  }

  /**
   * Get mappings by vertical
   */
  getMappingsByVertical(vertical: RevenueVertical): RevenueMapping[] {
    return Array.from(this.mappings.values()).filter((m) => m.vertical === vertical);
  }

  /**
   * Get top performing content
   */
  getTopPerformers(limit: number = 10): RevenueMapping[] {
    return Array.from(this.mappings.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  /**
   * Get content to scale (high performers)
   */
  getContentToScale(): RevenueMapping[] {
    return this.getMappingsByAction("scale");
  }

  /**
   * Determine action based on performance metrics
   */
  private determineAction(
    revenue: number,
    rpm?: number,
    engagement?: number
  ): { action: RevenueMapping["action"]; reason: string } {
    // High revenue = scale
    if (revenue > 1000) {
      return {
        action: "scale",
        reason: `High revenue ($${revenue.toFixed(2)}) - allocate more budget`,
      };
    }

    // Good RPM = optimize
    if (rpm && rpm > 10) {
      return {
        action: "optimize",
        reason: `Strong RPM ($${rpm.toFixed(2)}) - test variations`,
      };
    }

    // Low performance = pause
    if (revenue < 10 && rpm && rpm < 1) {
      return {
        action: "pause",
        reason: `Poor performance (revenue: $${revenue.toFixed(2)}, RPM: $${rpm.toFixed(2)})`,
      };
    }

    // Medium performance with good engagement = duplicate
    if (revenue > 50 && revenue < 500 && engagement && engagement > 0.05) {
      return {
        action: "duplicate",
        reason: `Good engagement (${(engagement * 100).toFixed(1)}%) - create similar content`,
      };
    }

    // Default = monitor
    return {
      action: "monitor",
      reason: "Collecting data - continue monitoring performance",
    };
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalMappings: number;
    totalRevenue: number;
    averageRPM: number;
    actionBreakdown: Record<RevenueMapping["action"], number>;
  } {
    const mappings = Array.from(this.mappings.values());
    const totalRevenue = mappings.reduce((sum, m) => sum + m.totalRevenue, 0);
    const rpms = mappings.filter((m) => m.rpm !== undefined).map((m) => m.rpm!);
    const averageRPM = rpms.length > 0 ? rpms.reduce((a, b) => a + b, 0) / rpms.length : 0;

    const actionBreakdown: Record<RevenueMapping["action"], number> = {
      scale: 0,
      optimize: 0,
      pause: 0,
      duplicate: 0,
      monitor: 0,
    };

    mappings.forEach((m) => {
      actionBreakdown[m.action]++;
    });

    return {
      totalMappings: mappings.length,
      totalRevenue,
      averageRPM,
      actionBreakdown,
    };
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.mappings.clear();
  }
}

// Singleton instance
export const revenueMapper = new RevenueMapper();
