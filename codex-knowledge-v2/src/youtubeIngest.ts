/**
 * Knowledge Engine v2.5 - YouTube Ingestion
 */

import type { IngestedContent } from "./types.js";
import { chunkContent } from "./extractor.js";

export async function ingestYouTube(url: string): Promise<IngestedContent> {
  console.log(`[YouTubeIngest] Processing YouTube: ${url}`);

  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // TODO: Implement actual YouTube transcript fetching
  // For now, return placeholder
  const rawContent = `YouTube video analysis not yet implemented. Video ID: ${videoId}. Use youtube-transcript or similar library.`;
  const chunks = chunkContent(rawContent);

  return {
    type: "youtube",
    source: url,
    rawContent,
    chunks,
    metadata: {
      videoId,
      url,
      processedAt: new Date().toISOString(),
      note: "YouTube transcript requires youtube-transcript library"
    }
  };
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
