// Content Routing Engine v2 ULTRA - Multi-LLM Routing Engine

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { Platform, Content, LLMSuggestion, LLMConsensus } from '../types.js';

export async function getLLMRoutingSuggestions(content: Content): Promise<LLMConsensus> {
  const providers = CONFIG.LLM_PROVIDERS;

  // Call all LLMs in parallel
  const suggestions = await Promise.all(
    providers.map(provider => callLLMForRouting(provider as any, content))
  );

  // Analyze consensus
  const platformCounts = new Map<Platform, number>();
  suggestions.forEach(s => {
    platformCounts.set(s.platform, (platformCounts.get(s.platform) || 0) + 1);
  });

  // Find top choice
  let topChoice: Platform = 'tiktok';
  let maxCount = 0;
  platformCounts.forEach((count, platform) => {
    if (count > maxCount) {
      maxCount = count;
      topChoice = platform;
    }
  });

  // Calculate agreement (0-1)
  const agreement = maxCount / suggestions.length;

  // Find divergent opinions
  const divergence: string[] = [];
  suggestions.forEach(s => {
    if (s.platform !== topChoice) {
      divergence.push(`${s.provider} suggests ${s.platform} (${s.reasoning})`);
    }
  });

  // Calculate consensus confidence
  const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
  const consensusConfidence = avgConfidence * agreement;

  return {
    topChoice,
    confidence: consensusConfidence,
    suggestions,
    agreement,
    divergence
  };
}

async function callLLMForRouting(
  provider: 'gpt4o' | 'claude' | 'gemini' | 'grok',
  content: Content
): Promise<LLMSuggestion> {
  try {
    const prompt = buildRoutingPrompt(content);
    
    const modelMap = {
      gpt4o: 'gpt-4o',
      claude: 'claude-3-5-sonnet-20241022',
      gemini: 'gemini-2.0-flash-exp',
      grok: 'grok-beta'
    };

    const providerMap = {
      gpt4o: 'openai',
      claude: 'anthropic',
      gemini: 'google',
      grok: 'xai'
    };

    const response = await axios.post(
      `${CONFIG.SERVICES.BRIDGE}/respond?provider=${providerMap[provider]}&model=${modelMap[provider]}`,
      {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      },
      { timeout: 10000 }
    );

    const llmResponse = response.data.content || response.data.message || '';
    return parseLLMResponse(provider, llmResponse);
  } catch (error) {
    console.warn(`[RoutingLLMEngine] ${provider} call failed:`, error);
    return {
      provider,
      platform: 'tiktok',
      confidence: 0.3,
      reasoning: 'LLM call failed, using default',
      timing: new Date().toISOString()
    };
  }
}

function buildRoutingPrompt(content: Content): string {
  return `Analyze this content and recommend the BEST platform for distribution.

Content:
- Type: ${content.type}
- Duration: ${content.duration || 'N/A'}s
- Language: ${content.language}
- Title: ${content.title}
- Description: ${content.description || 'N/A'}

Available platforms: TikTok, YouTube, Instagram, Twitter, LinkedIn

Respond in this EXACT format:
PLATFORM: [platform name]
CONFIDENCE: [0.0-1.0]
REASONING: [one sentence why this platform is best]
TIMING: [best posting time, e.g., "evening" or "morning"]
RISK: [LOW/MEDIUM/HIGH]`;
}

function parseLLMResponse(provider: 'gpt4o' | 'claude' | 'gemini' | 'grok', response: string): LLMSuggestion {
  // Parse LLM response
  const platformMatch = response.match(/PLATFORM:\s*(\w+)/i);
  const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/i);
  const reasoningMatch = response.match(/REASONING:\s*(.+?)(?:\n|$)/i);
  const timingMatch = response.match(/TIMING:\s*(.+?)(?:\n|$)/i);
  const riskMatch = response.match(/RISK:\s*(\w+)/i);

  const platformMap: Record<string, Platform> = {
    tiktok: 'tiktok',
    youtube: 'youtube',
    instagram: 'instagram',
    twitter: 'twitter',
    linkedin: 'linkedin'
  };

  const platformStr = (platformMatch?.[1] || 'tiktok').toLowerCase();
  const platform = platformMap[platformStr] || 'tiktok';

  return {
    provider,
    platform,
    confidence: parseFloat(confidenceMatch?.[1] || '0.7'),
    reasoning: reasoningMatch?.[1]?.trim() || 'No specific reasoning provided',
    timing: timingMatch?.[1]?.trim(),
    riskAssessment: riskMatch?.[1]?.toUpperCase()
  };
}

export function fuseLLMSuggestions(suggestions: LLMSuggestion[], weights?: Record<string, number>): Platform {
  // Default equal weights
  const defaultWeights = { gpt4o: 0.25, claude: 0.25, gemini: 0.25, grok: 0.25 };
  const w = weights || defaultWeights;

  // Score each platform
  const platformScores = new Map<Platform, number>();

  suggestions.forEach(s => {
    const weight = w[s.provider] || 0.25;
    const score = s.confidence * weight;
    platformScores.set(s.platform, (platformScores.get(s.platform) || 0) + score);
  });

  // Return platform with highest score
  let topPlatform: Platform = 'tiktok';
  let maxScore = 0;
  platformScores.forEach((score, platform) => {
    if (score > maxScore) {
      maxScore = score;
      topPlatform = platform;
    }
  });

  return topPlatform;
}
