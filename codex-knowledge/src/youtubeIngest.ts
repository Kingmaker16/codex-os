/**
 * Knowledge Engine v2 - YouTube Ingest
 * 
 * Ingests content from YouTube videos (transcript extraction).
 */

import type { IngestResult } from "./types.js";

/**
 * Ingest content from a YouTube video
 */
export async function ingestYoutube(url: string): Promise<IngestResult> {
  try {
    // Extract video ID
    const videoId = extractYoutubeId(url);
    
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // For v2, we return placeholder
    // Production would use youtube-transcript or similar API
    return {
      success: true,
      content: `YouTube video ${videoId} - transcript extraction requires youtube-transcript package`,
      metadata: {
        url,
        videoId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err: any) {
    return {
      success: false,
      content: "",
      metadata: { url },
      error: err.message
    };
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
