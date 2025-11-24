// fusionCreative.ts - Multi-LLM Fusion Creative Engine

import type {
  CreativeRequest,
  CreativePlan,
  LLMResponse,
  PacingPlan,
  EmotionalBeat,
  ThumbnailConcept,
  CaptionPlan,
  AudioPlan,
} from "./types.js";

const BRIDGE_URL = "http://localhost:4000";

export class FusionCreative {
  /**
   * Generate comprehensive creative plan using multi-LLM fusion
   * Queries GPT-4o, Claude, Gemini, Grok and fuses responses
   */
  async generateCreativePlan(request: CreativeRequest): Promise<CreativePlan> {
    console.log(`[FusionCreative] Generating plan for ${request.platform}`);

    // Parallel query all LLMs
    const llmResponses = await this.queryAllLLMs(request);

    // Fuse responses into comprehensive plan
    const plan = this.fuseLLMResponses(request, llmResponses);

    console.log(`[FusionCreative] Plan generated with consensus score: ${plan.consensusScore}`);
    return plan;
  }

  /**
   * Query all available LLM providers in parallel
   */
  private async queryAllLLMs(request: CreativeRequest): Promise<LLMResponse[]> {
    const providers = [
      { provider: "openai", model: "gpt-4o" },
      { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
      { provider: "google", model: "gemini-pro" },
      { provider: "xai", model: "grok-beta" },
    ];

    const prompt = this.buildCreativePrompt(request);

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
              max_tokens: 1000,
            }),
          }
        );

        if (!response.ok) {
          console.warn(`[FusionCreative] ${provider} failed: ${response.status}`);
          return null;
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        return {
          provider: provider as any,
          model,
          response: data,
          latency,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.warn(`[FusionCreative] ${provider} error:`, error);
        return null;
      }
    });

    const results = await Promise.all(queries);
    return results.filter((r) => r !== null) as LLMResponse[];
  }

  /**
   * Build creative prompt for LLMs
   */
  private buildCreativePrompt(request: CreativeRequest): string {
    return `You are an expert viral content strategist. Analyze this video creation request and provide:

Platform: ${request.platform}
Objective: ${request.objective || "viral"}
Target Audience: ${request.targetAudience || "general"}
Brand Voice: ${request.brandVoice || "energetic"}

Provide in JSON format:
{
  "hooks": ["3-5 attention-grabbing hook ideas"],
  "pacing": {
    "hookSeconds": 3,
    "buildSeconds": 10,
    "peakSeconds": 5,
    "resolveSeconds": 7,
    "ctaSeconds": 3
  },
  "script": ["2-3 script variations"],
  "cta": ["2-3 call-to-action suggestions"],
  "emotional_beats": [
    {"timestamp": 1.5, "emotion": "curiosity", "intensity": 0.9}
  ],
  "thumbnail_concepts": [
    {"concept": "description", "visual_hook": "what catches eye"}
  ]
}`;
  }

  /**
   * Fuse multiple LLM responses into consensus plan
   */
  private fuseLLMResponses(
    request: CreativeRequest,
    responses: LLMResponse[]
  ): CreativePlan {
    if (responses.length === 0) {
      // Fallback plan if all LLMs failed
      return this.generateFallbackPlan(request);
    }

    // Extract suggestions from each LLM
    const allHooks: string[] = [];
    const allScripts: string[] = [];
    const allCTAs: string[] = [];
    const allThumbnails: ThumbnailConcept[] = [];
    const allEmotionalBeats: EmotionalBeat[] = [];

    for (const llmResponse of responses) {
      try {
        const content =
          llmResponse.response.choices?.[0]?.message?.content ||
          llmResponse.response.content?.[0]?.text ||
          "";

        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          if (parsed.hooks) allHooks.push(...parsed.hooks);
          if (parsed.script) allScripts.push(...parsed.script);
          if (parsed.cta) allCTAs.push(...parsed.cta);
          if (parsed.thumbnail_concepts) {
            allThumbnails.push(
              ...parsed.thumbnail_concepts.map((t: any) => ({
                concept: t.concept || "",
                elements: t.elements || [],
                colorScheme: t.colorScheme || ["#FF0000", "#000000"],
                textOverlay: t.textOverlay,
                faceExpression: t.faceExpression,
                visualHook: t.visual_hook || t.visualHook || "",
                estimatedCTR: t.estimatedCTR || 0.05,
              }))
            );
          }
          if (parsed.emotional_beats) {
            allEmotionalBeats.push(
              ...parsed.emotional_beats.map((b: any) => ({
                timestamp: b.timestamp || 0,
                emotion: b.emotion || "excitement",
                intensity: b.intensity || 0.7,
                trigger: b.trigger,
              }))
            );
          }
        }
      } catch (error) {
        console.warn(`[FusionCreative] Failed to parse LLM response:`, error);
      }
    }

    // Calculate consensus score based on overlap
    const consensusScore = this.calculateConsensus(responses.length, allHooks.length);

    // Build comprehensive plan
    const plan: CreativePlan = {
      videoPath: request.videoPath,
      platform: request.platform,
      hookSuggestions: this.deduplicateAndRank(allHooks).slice(0, 5),
      pacingPlan: this.buildPacingPlan(request.platform),
      scriptSuggestions: this.deduplicateAndRank(allScripts).slice(0, 3),
      ctaSuggestions: this.deduplicateAndRank(allCTAs).slice(0, 3),
      emotionalBeats: this.mergeEmotionalBeats(allEmotionalBeats),
      thumbnailConcepts: allThumbnails.slice(0, 3),
      captionPlan: this.generateCaptionPlan(request),
      audioPlan: this.generateAudioPlan(request.platform),
      consensusScore,
      llmResponses: responses,
    };

    return plan;
  }

  /**
   * Build platform-specific pacing plan
   */
  private buildPacingPlan(platform: string): PacingPlan {
    const durations: Record<string, number> = {
      tiktok: 60,
      reels: 90,
      shorts: 60,
      youtube: 180,
    };

    const totalDuration = durations[platform] || 60;

    return {
      totalDuration,
      segments: [
        { start: 0, end: 3, type: "hook", intensity: 1.0, cutFrequency: 2.0 },
        { start: 3, end: 15, type: "build", intensity: 0.7, cutFrequency: 1.0 },
        {
          start: 15,
          end: totalDuration * 0.6,
          type: "peak",
          intensity: 0.9,
          cutFrequency: 1.5,
        },
        {
          start: totalDuration * 0.6,
          end: totalDuration - 5,
          type: "resolve",
          intensity: 0.6,
          cutFrequency: 0.5,
        },
        {
          start: totalDuration - 5,
          end: totalDuration,
          type: "cta",
          intensity: 0.8,
          cutFrequency: 1.0,
        },
      ],
      hookWindow: { start: 0, end: 3 },
      peakMoment: totalDuration * 0.4,
      ctaWindow: { start: totalDuration - 5, end: totalDuration },
    };
  }

  /**
   * Generate caption plan
   */
  private generateCaptionPlan(request: CreativeRequest): CaptionPlan {
    return {
      mainCaption: `🔥 ${request.platform} viral strategy! Watch this 👇`,
      alternates: [
        `POV: You discover the secret to ${request.platform} growth`,
        `This changed everything for my ${request.platform} 🚀`,
      ],
      hashtags: [`#${request.platform}`, "#viral", "#growth", "#content"],
      timing: [
        { text: "WATCH THIS", start: 0.5, end: 2.0, position: "top", style: "bold" },
        { text: "👀", start: 2.5, end: 4.0, position: "center", style: "animated" },
      ],
      hooks: ["Stop scrolling!", "You need to see this", "This is crazy"],
    };
  }

  /**
   * Generate audio plan
   */
  private generateAudioPlan(platform: string): AudioPlan {
    return {
      musicSuggestions: ["Trending Audio #1", "Upbeat Electronic", "Viral Sound"],
      soundEffects: [
        { type: "whoosh", timestamp: 0.5, description: "Attention grabber" },
        { type: "pop", timestamp: 3.0, description: "Beat drop" },
      ],
      loudnessTarget: -14.0, // Standard LUFS for social media
      normalizationRequired: true,
    };
  }

  /**
   * Deduplicate and rank suggestions by frequency
   */
  private deduplicateAndRank(items: string[]): string[] {
    const frequency = new Map<string, number>();
    items.forEach((item) => {
      const normalized = item.toLowerCase().trim();
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);
  }

  /**
   * Merge emotional beats from multiple sources
   */
  private mergeEmotionalBeats(beats: EmotionalBeat[]): EmotionalBeat[] {
    const merged = new Map<number, EmotionalBeat>();

    beats.forEach((beat) => {
      const key = Math.round(beat.timestamp * 2) / 2; // Round to nearest 0.5s
      const existing = merged.get(key);

      if (!existing || beat.intensity > existing.intensity) {
        merged.set(key, beat);
      }
    });

    return Array.from(merged.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate consensus score
   */
  private calculateConsensus(llmCount: number, suggestionCount: number): number {
    if (llmCount === 0) return 0;
    const overlap = suggestionCount / llmCount;
    return Math.min(100, Math.round(overlap * 20)); // Normalize to 0-100
  }

  /**
   * Generate fallback plan if all LLMs fail
   */
  private generateFallbackPlan(request: CreativeRequest): CreativePlan {
    console.warn("[FusionCreative] Using fallback plan - all LLMs unavailable");

    return {
      videoPath: request.videoPath,
      platform: request.platform,
      hookSuggestions: ["Stop scrolling!", "You need to see this", "Watch until the end"],
      pacingPlan: this.buildPacingPlan(request.platform),
      scriptSuggestions: [
        "Hook → Build tension → Reveal → CTA",
        "Problem → Solution → Results → Next steps",
      ],
      ctaSuggestions: [
        "Follow for more tips!",
        "Save this for later",
        "Share with someone who needs this",
      ],
      emotionalBeats: [
        { timestamp: 1.0, emotion: "curiosity", intensity: 0.9 },
        { timestamp: 10.0, emotion: "excitement", intensity: 0.8 },
        { timestamp: 25.0, emotion: "inspiration", intensity: 0.85 },
      ],
      thumbnailConcepts: [
        {
          concept: "Bold text with contrasting background",
          elements: ["text", "face", "contrast"],
          colorScheme: ["#FF0000", "#FFFF00", "#000000"],
          visualHook: "Eye-catching text overlay",
          estimatedCTR: 0.05,
        },
      ],
      captionPlan: this.generateCaptionPlan(request),
      audioPlan: this.generateAudioPlan(request.platform),
      consensusScore: 0,
      llmResponses: [],
    };
  }
}
