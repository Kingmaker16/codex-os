// Codex Monetization Engine v1 - Cost Tracker

export type CostCategory = "ads" | "inventory" | "tools" | "software" | "hosting" | "other";

export interface CostEntry {
  id: string;
  timestamp: Date;
  category: CostCategory;
  description: string;
  amount: number; // USD
  currency: string;
  vendor?: string;
  recurring: boolean;
  billingCycle?: "daily" | "weekly" | "monthly" | "annual";
  metadata?: Record<string, any>;
}

export class CostTracker {
  private costs: CostEntry[] = [];
  private maxCosts = 50000;

  /**
   * Record a cost entry
   */
  record(entry: Omit<CostEntry, "id" | "timestamp">): CostEntry {
    const fullEntry: CostEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.costs.push(fullEntry);

    if (this.costs.length > this.maxCosts) {
      this.costs.shift();
    }

    return fullEntry;
  }

  /**
   * Get costs by category
   */
  getByCategory(category: CostCategory, limit?: number): CostEntry[] {
    const filtered = this.costs.filter((c) => c.category === category);
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get costs by date range
   */
  getByDateRange(start: Date, end: Date): CostEntry[] {
    return this.costs.filter((c) => c.timestamp >= start && c.timestamp <= end);
  }

  /**
   * Get recurring costs
   */
  getRecurringCosts(): CostEntry[] {
    return this.costs.filter((c) => c.recurring);
  }

  /**
   * Get total costs
   */
  getTotalCosts(): number {
    return this.costs.reduce((sum, c) => sum + c.amount, 0);
  }

  /**
   * Get costs by category (summary)
   */
  getSummaryByCategory(): Record<CostCategory, number> {
    const summary: Record<CostCategory, number> = {
      ads: 0,
      inventory: 0,
      tools: 0,
      software: 0,
      hosting: 0,
      other: 0,
    };

    this.costs.forEach((c) => {
      summary[c.category] += c.amount;
    });

    return summary;
  }

  /**
   * Calculate monthly recurring costs
   */
  calculateMonthlyRecurringCosts(): number {
    const recurring = this.getRecurringCosts();
    
    return recurring.reduce((sum, cost) => {
      switch (cost.billingCycle) {
        case "daily":
          return sum + cost.amount * 30;
        case "weekly":
          return sum + cost.amount * 4;
        case "monthly":
          return sum + cost.amount;
        case "annual":
          return sum + cost.amount / 12;
        default:
          return sum;
      }
    }, 0);
  }

  /**
   * Get recent costs
   */
  getRecent(count: number = 100): CostEntry[] {
    return this.costs.slice(-count);
  }

  /**
   * Get all costs
   */
  getAll(): CostEntry[] {
    return [...this.costs];
  }

  /**
   * Clear all costs
   */
  clear(): void {
    this.costs = [];
  }

  /**
   * Get cost count
   */
  count(): number {
    return this.costs.length;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const costTracker = new CostTracker();
