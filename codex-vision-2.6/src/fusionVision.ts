// fusionVision.ts - Multi-LLM Vision Fusion

import type { LLMResponse, EditAction } from "./types.js";

const BRIDGE_URL = "http://localhost:4000";

export class FusionVision {
  /**
   * Query all LLMs for video editing suggestions
   */
  async queryAllLLMs(
    frameAnalysis: any,
    platform: string
  ): Promise<LLMResponse[]> {
    console.log("[FusionVision] Querying 4 LLM providers for edit suggestions");

    const providers = [
      { provider: "openai", model: "gpt-4o" },
      { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
      { provider: "google", model: "gemini-pro" },
      { provider: "xai", model: "grok-beta" },
    ];

    const prompt = this.buildVisionPrompt(frameAnalysis, platform);

    const queries = providers.map(async ({ provider, model }) => {
      const startTime = Date.now();
      try {
        const response = await fetch(
          `${BRIDGE_URL}/respond?provider=${provider}&model=${model}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
              max_tokens: 1500,
            }),
          }
        );

        if (!response.ok) {
          console.warn(`[FusionVision] ${provider} failed: ${response.status}`);
          return null;
        }

        const data = (await response.json()) as any;
        const latency = Date.now() - startTime;

        return {
          provider: provider as any,
          model,
          suggestions: data,
          latency,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.warn(`[FusionVision] ${provider} error:`, error);
        return null;
      }
    });

    const results = await Promise.all(queries);
    return results.filter((r) => r !== null) as LLMResponse[];
  }

  /**
   * Build vision prompt for LLMs
   */
  private buildVisionPrompt(frameAnalysis: any, platform: string): string {
    return `You are an expert video editor analyzing content for ${platform}. 

Frame Analysis:
- Duration: ${frameAnalysis.duration}s
- Hook quality: ${frameAnalysis.hookQuality}
- Pacing: ${frameAnalysis.pacing} cuts/sec (ideal: ${frameAnalysis.idealPacing})
- Dead frames: ${frameAnalysis.deadFrames || 0}
- Color issues: ${frameAnalysis.colorIssues || 0}

Suggest specific edit actions in JSON format:
{
  "actions": [
    {
      "type": "trim|cut|jump_zoom|crop|contrast|color_lift|saturation_bump|speed_ramp|text_overlay|zoom_to_face",
      "timestamp": 5.2,
      "parameters": {...},
      "reason": "why this edit improves engagement",
      "priority": "low|medium|high|critical"
    }
  ],
  "impact": {
    "retentionIncrease": 15,
    "engagementIncrease": 20,
    "viralPotential": 75
  }
}

Focus on: hook strength (0-3s), pacing optimization, visual polish, retention.`;
  }

  /**
   * Fuse multiple LLM responses into consensus edit suggestions
   */
  fuseEditSuggestions(
    responses: LLMResponse[],
    platform: string
  ): { actions: EditAction[]; consensusScore: number } {
    if (responses.length === 0) {
      return { actions: this.getFallbackActions(platform), consensusScore: 0 };
    }

    const allActions: EditAction[] = [];
    let actionIdCounter = 0;

    // Extract actions from each LLM
    for (const llmResponse of responses) {
      try {
        const content =
          llmResponse.suggestions.choices?.[0]?.message?.content ||
          llmResponse.suggestions.content?.[0]?.text ||
          "";

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          if (parsed.actions && Array.isArray(parsed.actions)) {
            parsed.actions.forEach((action: any) => {
              allActions.push({
                id: `action_${++actionIdCounter}`,
                type: action.type || "trim",
                timestamp: action.timestamp || 0,
                duration: action.duration,
                parameters: action.parameters || {},
                reason: action.reason || "Suggested by AI",
                confidence: 0.8,
                priority: action.priority || "medium",
              });
            });
          }
        }
      } catch (error) {
        console.warn("[FusionVision] Failed to parse LLM response:", error);
      }
    }

    // Deduplicate similar actions (same type + similar timestamp)
    const uniqueActions = this.deduplicateActions(allActions);

    // Calculate consensus score
    const consensusScore = this.calculateConsensus(
      responses.length,
      allActions.length,
      uniqueActions.length
    );

    return { actions: uniqueActions, consensusScore };
  }

  /**
   * Deduplicate similar edit actions
   */
  private deduplicateActions(actions: EditAction[]): EditAction[] {
    const unique = new Map<string, EditAction>();

    actions.forEach((action) => {
      const key = `${action.type}_${Math.round(action.timestamp * 2) / 2}`; // 0.5s buckets
      const existing = unique.get(key);

      if (!existing || action.confidence > existing.confidence) {
        unique.set(key, action);
      }
    });

    return Array.from(unique.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate consensus score
   */
  private calculateConsensus(
    llmCount: number,
    totalActions: number,
    uniqueActions: number
  ): number {
    if (llmCount === 0) return 0;

    const overlapRatio = 1 - uniqueActions / Math.max(totalActions, 1);
    const participationScore = (llmCount / 4) * 100; // 4 LLMs max

    return Math.round((overlapRatio * 60 + participationScore * 0.4));
  }

  /**
   * Get fallback actions if all LLMs fail
   */
  private getFallbackActions(platform: string): EditAction[] {
    console.warn("[FusionVision] Using fallback actions - all LLMs unavailable");

    return [
      {
        id: "fallback_1",
        type: "trim",
        timestamp: 0,
        duration: 1.0,
        parameters: { reason: "Remove slow start" },
        reason: "Hook must start immediately",
        confidence: 0.6,
        priority: "high",
      },
      {
        id: "fallback_2",
        type: "saturation_bump",
        timestamp: 2.0,
        parameters: { intensity: 1.2 },
        reason: "Increase visual pop",
        confidence: 0.7,
        priority: "medium",
      },
      {
        id: "fallback_3",
        type: "text_overlay",
        timestamp: 1.5,
        duration: 2.0,
        parameters: { text: "WATCH THIS", position: "top" },
        reason: "Hook attention",
        confidence: 0.8,
        priority: "high",
      },
    ];
  }
}
