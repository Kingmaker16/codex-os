import { v4 as uuidv4 } from "uuid";
import { Calendar, DistributionSlot, Platform, ContentType, Language } from "../types.js";
import { CONFIG } from "../config.js";

export class DistributionScheduler {
  generateCalendar(
    startDate: Date,
    platforms: Platform[],
    languages: Language[] = ["en"]
  ): Calendar {
    const calendarId = uuidv4();
    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + CONFIG.CALENDAR.DAYS_AHEAD);

    const slots: DistributionSlot[] = [];

    for (let day = 0; day < CONFIG.CALENDAR.DAYS_AHEAD; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + day);

      for (const platform of platforms) {
        const platformConfig = CONFIG.PLATFORMS[platform];
        const peakHours = platformConfig.peakHours;

        for (const hour of peakHours) {
          for (const language of languages) {
            const slotTime = new Date(currentDate);
            slotTime.setHours(hour, 0, 0, 0);

            const slot: DistributionSlot = {
              id: uuidv4(),
              platform,
              datetime: slotTime.toISOString(),
              accountId: "",
              contentType: this.selectContentType(platform),
              language,
              status: "PLANNED"
            };

            slots.push(slot);
          }
        }
      }
    }

    return {
      id: calendarId,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      slots,
      metadata: {
        totalSlots: slots.length,
        platforms,
        languages
      }
    };
  }

  private selectContentType(platform: Platform): ContentType {
    const platformConfig = CONFIG.PLATFORMS[platform];
    const types = platformConfig.contentTypes as ContentType[];
    return types[0];
  }

  sortSlotsByTrend(slots: DistributionSlot[]): DistributionSlot[] {
    return slots.sort((a, b) => {
      const scoreA = a.trendScore || 0;
      const scoreB = b.trendScore || 0;
      return scoreB - scoreA;
    });
  }

  filterSlotsByPlatform(slots: DistributionSlot[], platform: Platform): DistributionSlot[] {
    return slots.filter(s => s.platform === platform);
  }

  filterSlotsByTimeRange(slots: DistributionSlot[], start: Date, end: Date): DistributionSlot[] {
    return slots.filter(s => {
      const slotTime = new Date(s.datetime);
      return slotTime >= start && slotTime <= end;
    });
  }

  getNextAvailableSlot(slots: DistributionSlot[], platform: Platform): DistributionSlot | null {
    const available = slots.filter(s => 
      s.platform === platform && 
      s.status === "PLANNED" && 
      !s.contentId
    );

    return available.length > 0 ? available[0] : null;
  }

  assignContentToSlot(slot: DistributionSlot, contentId: string, accountId: string): DistributionSlot {
    return {
      ...slot,
      contentId,
      accountId,
      status: "QUEUED"
    };
  }

  calculateVelocity(slots: DistributionSlot[], platform: Platform): number {
    const platformSlots = this.filterSlotsByPlatform(slots, platform);
    const queuedSlots = platformSlots.filter(s => s.status === "QUEUED" || s.status === "PLANNED");
    
    if (queuedSlots.length === 0) return 0;

    const timeSpan = CONFIG.CALENDAR.DAYS_AHEAD * 24;
    return queuedSlots.length / timeSpan;
  }
}

export const distributionScheduler = new DistributionScheduler();
