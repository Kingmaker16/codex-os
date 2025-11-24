import { DistributionState, DistributionPlan, Calendar, DistributionSlot } from "../types.js";

class StateManager {
  private state: DistributionState;

  constructor() {
    this.state = {
      activePlans: new Map(),
      calendars: new Map(),
      publishQueue: [],
      failedSlots: [],
      metrics: {
        totalPublished: 0,
        successRate: 0,
        avgVisibilityScore: 0
      }
    };
  }

  createPlan(plan: DistributionPlan): void {
    this.state.activePlans.set(plan.id, plan);
  }

  getPlan(planId: string): DistributionPlan | undefined {
    return this.state.activePlans.get(planId);
  }

  updatePlan(planId: string, updates: Partial<DistributionPlan>): void {
    const plan = this.state.activePlans.get(planId);
    if (plan) {
      this.state.activePlans.set(planId, { ...plan, ...updates });
    }
  }

  getAllPlans(): DistributionPlan[] {
    return Array.from(this.state.activePlans.values());
  }

  createCalendar(calendar: Calendar): void {
    this.state.calendars.set(calendar.id, calendar);
  }

  getCalendar(calendarId: string): Calendar | undefined {
    return this.state.calendars.get(calendarId);
  }

  getAllCalendars(): Calendar[] {
    return Array.from(this.state.calendars.values());
  }

  addToQueue(slot: DistributionSlot): void {
    this.state.publishQueue.push(slot);
  }

  removeFromQueue(slotId: string): void {
    this.state.publishQueue = this.state.publishQueue.filter(s => s.id !== slotId);
  }

  getQueue(): DistributionSlot[] {
    return [...this.state.publishQueue];
  }

  markSlotFailed(slot: DistributionSlot): void {
    this.state.failedSlots.push(slot);
    this.removeFromQueue(slot.id);
  }

  getFailedSlots(): DistributionSlot[] {
    return [...this.state.failedSlots];
  }

  updateMetrics(published: number, success: boolean, visibilityScore?: number): void {
    this.state.metrics.totalPublished += published;
    
    const totalAttempts = this.state.metrics.totalPublished + this.state.failedSlots.length;
    this.state.metrics.successRate = totalAttempts > 0 
      ? this.state.metrics.totalPublished / totalAttempts 
      : 0;

    if (visibilityScore !== undefined) {
      const currentTotal = this.state.metrics.avgVisibilityScore * (this.state.metrics.totalPublished - 1);
      this.state.metrics.avgVisibilityScore = (currentTotal + visibilityScore) / this.state.metrics.totalPublished;
    }
  }

  getMetrics() {
    return { ...this.state.metrics };
  }

  getState(): DistributionState {
    return {
      activePlans: new Map(this.state.activePlans),
      calendars: new Map(this.state.calendars),
      publishQueue: [...this.state.publishQueue],
      failedSlots: [...this.state.failedSlots],
      metrics: { ...this.state.metrics }
    };
  }

  clearOldPlans(daysOld: number = 7): void {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    for (const [id, plan] of this.state.activePlans.entries()) {
      if (new Date(plan.createdAt).getTime() < cutoff && plan.status === "COMPLETED") {
        this.state.activePlans.delete(id);
      }
    }
  }
}

export const stateManager = new StateManager();
