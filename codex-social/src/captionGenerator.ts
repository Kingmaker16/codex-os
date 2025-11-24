/**
 * Social Engine v1.5 - Caption Generator
 * Generate captions, titles, and descriptions using AI
 */

import fetch from "node-fetch";

const ORCHESTRATOR = "http://localhost:4200";

export interface CaptionInput {
  platform: "tiktok" | "youtube" | "instagram";
  niche: string;
  script?: string;
  brandTone?: string;
}

export interface CaptionOutput {
  title: string;
  caption: string;
  tags: string[];
}

/**
 * Generate caption, title, and tags for a video
 */
export async function generateCaption(input: CaptionInput): Promise<CaptionOutput> {
  const { platform, niche, script, brandTone } = input;

  try {
    // Build prompt for caption generation
    const prompt = buildCaptionPrompt(platform, niche, script, brandTone);

    // Call Orchestrator to generate caption via Bridge
    const response = await fetch(`${ORCHESTRATOR}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "codex-social-captions",
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert social media copywriter. Generate engaging captions optimized for virality and engagement.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.warn("Orchestrator unavailable, using fallback");
      return generateFallbackCaption(platform, niche);
    }

    const data = (await response.json()) as any;
    const text = data.choices?.[0]?.message?.content || "";

    // Parse the AI response
    return parseCaptionResponse(text, platform, niche);
  } catch (err) {
    console.error("Caption generation error:", err);
    return generateFallbackCaption(platform, niche);
  }
}

/**
 * Build prompt for caption generation
 */
function buildCaptionPrompt(
  platform: string,
  niche: string,
  script?: string,
  brandTone?: string
): string {
  const tone = brandTone || "engaging and energetic";
  const scriptContext = script ? `\n\nVideo Script:\n${script}` : "";

  const platformGuidelines: Record<string, string> = {
    tiktok: "TikTok: Hook in first 3 seconds, use trending sounds, max 150 chars, 3-5 hashtags",
    youtube: "YouTube Shorts: Clear title (max 100 chars), detailed description, 3-5 hashtags",
    instagram: "Instagram Reels: First line must hook, max 2200 chars, 5-10 hashtags, line breaks",
  };

  return `Generate a ${platform} caption for a ${niche} video with ${tone} tone.

${platformGuidelines[platform]}

Requirements:
1. Title: Catchy and attention-grabbing
2. Caption: Engaging with hook, value, and CTA
3. Tags: ${platform === "instagram" ? "10" : "5"} relevant hashtags

Format your response as:
TITLE: [title here]
CAPTION: [caption here]
TAGS: #tag1 #tag2 #tag3${scriptContext}`;
}

/**
 * Parse AI-generated caption response
 */
function parseCaptionResponse(text: string, platform: string, niche: string): CaptionOutput {
  try {
    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const captionMatch = text.match(/CAPTION:\s*([\s\S]+?)(?=TAGS:|$)/i);
    const tagsMatch = text.match(/TAGS:\s*(.+)/i);

    const title = titleMatch?.[1]?.trim() || `${niche} Content`;
    const caption = captionMatch?.[1]?.trim() || `Check this out! #${niche}`;
    const tagsText = tagsMatch?.[1]?.trim() || "";
    
    const tags = tagsText
      .split(/[\s,]+/)
      .filter((t) => t.startsWith("#"))
      .map((t) => t.trim())
      .slice(0, platform === "instagram" ? 10 : 5);

    // Add default tags if AI didn't provide enough
    if (tags.length === 0) {
      tags.push(`#${niche}`, "#fyp", "#viral");
    }

    return { title, caption, tags };
  } catch (err) {
    console.error("Parse error:", err);
    return generateFallbackCaption(platform, niche);
  }
}

/**
 * Generate fallback caption when AI is unavailable
 */
function generateFallbackCaption(platform: string, niche: string): CaptionOutput {
  const defaultTags: Record<string, string[]> = {
    tiktok: [`#${niche}`, "#fyp", "#viral", "#trending", "#foryou"],
    youtube: [`#${niche}`, "#Shorts", "#YouTubeShorts"],
    instagram: [`#${niche}`, "#reels", "#explore", "#viral"],
  };

  return {
    title: `${niche} Content`,
    caption: `Check this out! 🔥\n\nFollow for more ${niche} content!`,
    tags: defaultTags[platform] || [`#${niche}`, "#content"],
  };
}
