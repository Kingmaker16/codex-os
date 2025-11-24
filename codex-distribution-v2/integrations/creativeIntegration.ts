import { Language, Content } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function enhanceContent(
  contentId: string,
  enhancements: string[]
): Promise<{ enhanced: boolean; newContentId?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/creative/enhance`, {
      contentId,
      enhancements
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return {
      enhanced: response.data.success || false,
      newContentId: response.data.enhancedContentId
    };
  } catch (error) {
    console.error("Content enhancement failed:", error);
    return { enhanced: false };
  }
}

export async function translateContent(
  contentId: string,
  targetLanguage: Language
): Promise<{ translated: boolean; translatedContentId?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/creative/translate`, {
      contentId,
      targetLanguage
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return {
      translated: response.data.success || false,
      translatedContentId: response.data.translatedContentId
    };
  } catch (error) {
    console.error("Content translation failed:", error);
    return { translated: false };
  }
}

export async function generateVariations(
  contentId: string,
  variationCount: number
): Promise<{ contentIds: string[] }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/creative/variations`, {
      contentId,
      count: variationCount
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return { contentIds: response.data.variationIds || [] };
  } catch (error) {
    console.error("Failed to generate variations:", error);
    return { contentIds: [] };
  }
}
