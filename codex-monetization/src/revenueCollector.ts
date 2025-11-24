// Codex Monetization Engine v1 - Revenue Collector

export type RevenueVertical = "social" | "ecom" | "trading" | "roulette" | "other";

export interface RevenueEntry {
  id: string;
  timestamp: Date;
  vertical: RevenueVertical;
  platform: string; // TikTok, YouTube, Instagram, Shopify, etc.
  amount: number; // USD
  currency: string;
  contentId?: string; // Post/video ID
  campaignId?: string;
  metadata?: Record<string, any>;
}

export class RevenueCollector {
  private entries: RevenueEntry[] = [];
  private maxEntries = 50000; // Keep last 50k entries

  /**
   * Record a revenue entry
   */
  record(entry: Omit<RevenueEntry, "id" | "timestamp">): RevenueEntry {
    const fullEntry: RevenueEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.entries.push(fullEntry);

    // Trim old entries if exceeds max
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    return fullEntry;
  }

  /**
   * Get revenue by vertical
   */
  getByVertical(vertical: RevenueVertical, limit?: number): RevenueEntry[] {
    const filtered = this.entries.filter((e) => e.vertical === vertical);
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get revenue by platform
   */
  getByPlatform(platform: string, limit?: number): RevenueEntry[] {
    const filtered = this.entries.filter(
      (e) => e.platform.toLowerCase() === platform.toLowerCase()
    );
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get revenue by date range
   */
  getByDateRange(start: Date, end: Date): RevenueEntry[] {
    return this.entries.filter(
      (e) => e.timestamp >= start && e.timestamp <= end
    );
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(): number {
    return this.entries.reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Get revenue by vertical (summary)
   */
  getSummaryByVertical(): Record<RevenueVertical, number> {
    const summary: Record<RevenueVertical, number> = {
      social: 0,
      ecom: 0,
      trading: 0,
      roulette: 0,
      other: 0,
    };

    this.entries.forEach((e) => {
      summary[e.vertical] += e.amount;
    });

    return summary;
  }

  /**
   * Get revenue by platform (summary)
   */
  getSummaryByPlatform(): Record<string, number> {
    const summary: Record<string, number> = {};

    this.entries.forEach((e) => {
      if (!summary[e.platform]) {
        summary[e.platform] = 0;
      }
      summary[e.platform] += e.amount;
    });

    return summary;
  }

  /**
   * Get recent entries
   */
  getRecent(count: number = 100): RevenueEntry[] {
    return this.entries.slice(-count);
  }

  /**
   * Get all entries
   */
  getAll(): RevenueEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get entry count
   */
  count(): number {
    return this.entries.length;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const revenueCollector = new RevenueCollector();
