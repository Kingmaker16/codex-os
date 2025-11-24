/**
 * Knowledge Engine v2.5 - Content Extractor
 * 
 * Chunks content and extracts features
 */

import type { ContentChunk } from "./types.js";
import { CONFIG } from "./config.js";

export function chunkContent(content: string, maxChunkSize = CONFIG.maxChunkSize): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const paragraphs = content.split(/\n\n+/);
  
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        index: chunkIndex,
        tokens: estimateTokens(currentChunk)
      });
      chunkIndex++;
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunkIndex}`,
      content: currentChunk.trim(),
      index: chunkIndex,
      tokens: estimateTokens(currentChunk)
    });
  }

  return chunks;
}

export function extractKeywords(content: string): string[] {
  // Simple keyword extraction
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4);

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
