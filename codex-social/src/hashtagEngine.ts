/**
 * Social Engine v1.5 - Hashtag Engine
 * Suggest hashtags for each platform using AI and best practices
 */

import fetch from "node-fetch";

const ORCHESTRATOR = "http://localhost:4200";

export interface HashtagInput {
  platform: "tiktok" | "youtube" | "instagram";
  niche: string;
  caption: string;
}

/**
 * Suggest hashtags for a post
 */
export async function suggestHashtags(input: HashtagInput): Promise<string[]> {
  const { platform, niche, caption } = input;

  try {
    // Get AI-suggested hashtags
    const aiTags = await getAIHashtags(platform, niche, caption);
    
    // Get platform-specific base tags
    const baseTags = getPlatformBaseTags(platform, niche);
    
    // Combine and deduplicate
    const allTags = [...new Set([...aiTags, ...baseTags])];
    
    // Limit based on platform
    const maxTags = platform === "instagram" ? 10 : 5;
    return allTags.slice(0, maxTags);
  } catch (err) {
    console.error("Hashtag suggestion error:", err);
    return getPlatformBaseTags(platform, niche);
  }
}

/**
 * Get AI-suggested hashtags via Knowledge Engine
 */
async function getAIHashtags(
  platform: string,
  niche: string,
  caption: string
): Promise<string[]> {
  try {
    const response = await fetch(`${ORCHESTRATOR}/research/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `Top trending hashtags for ${platform} in ${niche} niche. Include viral and discovery tags.`,
        maxResults: 5,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as any;
    
    // Extract hashtags from research results
    const text = JSON.stringify(data);
    const hashtagMatches = text.match(/#[\w]+/g) || [];
    
    return [...new Set(hashtagMatches)].slice(0, 5);
  } catch (err) {
    return [];
  }
}

/**
 * Get platform base hashtags
 */
function getPlatformBaseTags(platform: string, niche: string): string[] {
  const baseTags: Record<string, string[]> = {
    tiktok: [
      `#${niche}`,
      "#fyp",
      "#foryou",
      "#foryoupage",
      "#viral",
      "#trending",
      "#tiktok",
    ],
    youtube: [
      `#${niche}`,
      "#Shorts",
      "#YouTubeShorts",
      "#YouTube",
      "#viral",
    ],
    instagram: [
      `#${niche}`,
      "#reels",
      "#reelsinstagram",
      "#explore",
      "#explorepage",
      "#viral",
      "#trending",
      "#instagram",
      "#instagood",
      "#fyp",
    ],
  };

  const tags = baseTags[platform] || [`#${niche}`, "#viral"];
  
  // Limit based on platform
  return tags.slice(0, platform === "instagram" ? 10 : 5);
}

/**
 * Validate hashtag format
 */
export function validateHashtag(tag: string): boolean {
  // Must start with #, contain only alphanumeric and underscores
  return /^#[\w]+$/.test(tag);
}

/**
 * Clean and format hashtags
 */
export function formatHashtags(tags: string[]): string[] {
  return tags
    .map((tag) => {
      // Add # if missing
      if (!tag.startsWith("#")) {
        tag = `#${tag}`;
      }
      // Remove spaces and special chars
      tag = tag.replace(/[^\w#]/g, "");
      return tag;
    })
    .filter((tag) => validateHashtag(tag));
}
