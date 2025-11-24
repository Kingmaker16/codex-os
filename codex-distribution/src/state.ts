import { DistributionPlan, PlanCreateRequest, ContentSlot, AccountRouting, DistPlatform } from "./types.js";
import { v4 as uuid } from "uuid";

const plans: Map<string, DistributionPlan> = new Map();

export function createPlan(payload: PlanCreateRequest, routing: AccountRouting[]): DistributionPlan {
  const id = uuid();
  const now = new Date().toISOString();

  const slots: ContentSlot[] = [];

  const days = 7;
  const postsPerDay = 2;

  for (const route of routing) {
    for (let d = 0; d < days; d++) {
      for (let p = 0; p < postsPerDay; p++) {
        const slotId = uuid();
        const scheduledFor = new Date(Date.now() + (d * 24 + (10 + p * 4)) * 60 * 60 * 1000).toISOString();
        slots.push({
          id: slotId,
          platform: route.platform,
          accountId: route.accountId,
          scheduledFor,
          contentId: "",
          status: "PLANNED"
        });
      }
    }
  }

  const plan: DistributionPlan = {
    id,
    name: payload.name,
    productName: payload.productName,
    target: payload.target,
    routing,
    slots,
    createdAt: now,
    updatedAt: now
  };

  plans.set(id, plan);
  return plan;
}

export function listPlans(): DistributionPlan[] {
  return Array.from(plans.values());
}

export function getPlan(id: string): DistributionPlan | undefined {
  return plans.get(id);
}

export function updatePlan(p: DistributionPlan): void {
  p.updatedAt = new Date().toISOString();
  plans.set(p.id, p);
}

export function markSlotPosted(planId: string, slotId: string): void {
  const plan = plans.get(planId);
  if (!plan) return;
  const slot = plan.slots.find(s => s.id === slotId);
  if (!slot) return;
  slot.status = "POSTED";
  updatePlan(plan);
}
