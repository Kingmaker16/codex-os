import { Language, Content, DistributionSlot } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function planLanguageDistribution(
  content: Content,
  targetLanguages: Language[]
): Promise<{ language: Language; contentId: string }[]> {
  const distributions: { language: Language; contentId: string }[] = [];

  for (const language of targetLanguages) {
    if (language === content.language) {
      distributions.push({ language, contentId: content.id });
    } else {
      const translatedId = await requestTranslation(content.id, language);
      distributions.push({ language, contentId: translatedId });
    }
  }

  return distributions;
}

async function requestTranslation(contentId: string, targetLanguage: Language): Promise<string> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/translate`, {
      contentId,
      targetLanguage
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return response.data.translatedContentId || `${contentId}-${targetLanguage}`;
  } catch (error) {
    console.error(`Translation failed for ${contentId} to ${targetLanguage}:`, error);
    return `${contentId}-${targetLanguage}-stub`;
  }
}

export async function assignLanguageToSlots(
  slots: DistributionSlot[],
  languageDistributions: { language: Language; contentId: string }[]
): Promise<DistributionSlot[]> {
  return slots.map(slot => {
    const distribution = languageDistributions.find(d => d.language === slot.language);
    if (distribution) {
      return {
        ...slot,
        contentId: distribution.contentId
      };
    }
    return slot;
  });
}

export function getLanguagePriority(platform: string): Language[] {
  const priorities: Record<string, Language[]> = {
    tiktok: ["en", "es", "ar"],
    youtube: ["en", "es", "ar"],
    instagram: ["en", "es", "ar"],
    twitter: ["en", "es", "ar"],
    linkedin: ["en", "es", "ar"]
  };

  return priorities[platform] || ["en"];
}
