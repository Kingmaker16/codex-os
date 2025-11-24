import { v4 as uuidv4 } from "uuid";
import { Calendar, DistributionSlot, Platform } from "../types.js";
import { distributionScheduler } from "../scheduler/distributionScheduler.js";

export async function generateWeeklyCalendar(platforms: Platform[]): Promise<Calendar> {
  const startDate = new Date();
  const calendar = distributionScheduler.generateCalendar(startDate, platforms, ["en", "es", "ar"]);
  
  return calendar;
}

export async function optimizeCalendarSlots(calendar: Calendar, trendData: any[]): Promise<Calendar> {
  const optimizedSlots = calendar.slots.map(slot => {
    const trend = trendData.find(t => t.platform === slot.platform);
    if (trend) {
      return {
        ...slot,
        trendScore: trend.score || 0
      };
    }
    return slot;
  });

  const sorted = distributionScheduler.sortSlotsByTrend(optimizedSlots);

  return {
    ...calendar,
    slots: sorted
  };
}

export async function fillCalendarWithContent(
  calendar: Calendar,
  contentIds: string[],
  accounts: any[]
): Promise<Calendar> {
  const slots = [...calendar.slots];
  let contentIndex = 0;

  for (let i = 0; i < slots.length && contentIndex < contentIds.length; i++) {
    const slot = slots[i];
    if (slot.status === "PLANNED" && !slot.contentId) {
      const account = accounts.find(a => a.platform === slot.platform && a.status === "ACTIVE");
      if (account) {
        slots[i] = distributionScheduler.assignContentToSlot(
          slot,
          contentIds[contentIndex],
          account.id
        );
        contentIndex++;
      }
    }
  }

  return {
    ...calendar,
    slots
  };
}
