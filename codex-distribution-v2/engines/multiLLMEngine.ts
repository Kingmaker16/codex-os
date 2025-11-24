import { Platform, LLMSuggestion } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function getLLMDistributionSuggestions(
  contentId: string,
  platforms: Platform[]
): Promise<LLMSuggestion[]> {
  const suggestions: LLMSuggestion[] = [];

  const promises = CONFIG.LLM_PROVIDERS.map(async ({ provider, model }) => {
    try {
      const suggestion = await callLLMForSuggestion(contentId, platforms, provider, model);
      return suggestion;
    } catch (error) {
      console.error(`LLM ${provider} failed:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  
  for (const result of results) {
    if (result) suggestions.push(result);
  }

  return suggestions;
}

async function callLLMForSuggestion(
  contentId: string,
  platforms: Platform[],
  provider: string,
  model: string
): Promise<LLMSuggestion> {
  const prompt = buildDistributionPrompt(contentId, platforms);

  try {
    const response = await axios.post(
      `${CONFIG.SERVICES.BRIDGE}/respond?provider=${provider}&model=${model}`,
      {
        messages: [
          {
            role: "system",
            content: "You are a social media distribution expert. Analyze content and suggest optimal posting times and platforms."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      },
      { timeout: CONFIG.TIMEOUTS.LLM_CALL }
    );

    const llmText = response.data.response || response.data.content || "";
    const parsed = parseLLMSuggestions(llmText, platforms);

    return {
      provider,
      model,
      suggestions: parsed
    };
  } catch (error) {
    console.error(`Failed to call LLM ${provider}/${model}:`, error);
    throw error;
  }
}

function buildDistributionPrompt(contentId: string, platforms: Platform[]): string {
  return `Analyze content ${contentId} for distribution across platforms: ${platforms.join(", ")}.

For each platform, suggest:
1. Optimal posting time (hour of day, 0-23)
2. Rationale for timing
3. Confidence score (0-1)

Format your response as JSON array:
[
  {
    "platform": "tiktok",
    "timing": "18:00",
    "rationale": "Peak engagement time for Gen Z audience",
    "confidence": 0.85
  }
]`;
}

function parseLLMSuggestions(
  llmText: string,
  platforms: Platform[]
): { platform: Platform; timing: string; rationale: string; confidence: number }[] {
  try {
    const jsonMatch = llmText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Failed to parse LLM suggestions:", error);
  }

  return platforms.map(platform => ({
    platform,
    timing: "12:00",
    rationale: "Default suggestion",
    confidence: 0.5
  }));
}

export function fuseLLMSuggestions(suggestions: LLMSuggestion[]): Record<Platform, { timing: string; confidence: number }> {
  const fused: Record<Platform, { timing: string; confidence: number }> = {} as any;

  for (const suggestion of suggestions) {
    for (const item of suggestion.suggestions) {
      if (!fused[item.platform]) {
        fused[item.platform] = {
          timing: item.timing,
          confidence: item.confidence
        };
      } else {
        const current = fused[item.platform];
        if (item.confidence > current.confidence) {
          fused[item.platform] = {
            timing: item.timing,
            confidence: item.confidence
          };
        }
      }
    }
  }

  return fused;
}
