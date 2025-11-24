/**
 * Knowledge Engine v2 - Chunk Extractor
 * 
 * Breaks text into conceptual chunks for analysis.
 */

import { randomUUID } from "crypto";
import { CONFIG } from "./config.js";
import type { ConceptChunk } from "./types.js";

/**
 * Extract conceptual chunks from text
 */
export function extractChunks(text: string, topic: string): ConceptChunk[] {
  const chunks: ConceptChunk[] = [];
  
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  let currentChunk = "";
  let chunkId = 1;
  
  for (const paragraph of paragraphs) {
    const cleaned = paragraph.trim();
    
    if (currentChunk.length + cleaned.length > CONFIG.maxChunkSize) {
      // Save current chunk if it meets minimum size
      if (currentChunk.length >= CONFIG.minChunkSize) {
        chunks.push(createChunk(currentChunk, topic, chunkId++));
      }
      currentChunk = cleaned;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + cleaned;
    }
  }
  
  // Add final chunk
  if (currentChunk.length >= CONFIG.minChunkSize) {
    chunks.push(createChunk(currentChunk, topic, chunkId));
  }
  
  return chunks;
}

/**
 * Create a concept chunk with basic analysis
 */
function createChunk(text: string, topic: string, id: number): ConceptChunk {
  // Extract potential concepts (capitalized terms, technical terms)
  const concepts = extractConcepts(text);
  
  // Calculate relevance based on topic keywords
  const relevance = calculateRelevance(text, topic);
  
  return {
    id: `chunk-${id}-${randomUUID().slice(0, 8)}`,
    text,
    topic,
    concepts,
    relevance
  };
}

/**
 * Extract key concepts from text
 */
function extractConcepts(text: string): string[] {
  const concepts = new Set<string>();
  
  // Find capitalized phrases (potential concepts)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern) || [];
  
  for (const match of matches) {
    if (match.length > 3 && match.length < 50) {
      concepts.add(match);
    }
  }
  
  // Find quoted terms
  const quotedPattern = /"([^"]+)"/g;
  let quotedMatch;
  while ((quotedMatch = quotedPattern.exec(text)) !== null) {
    if (quotedMatch[1].length > 3 && quotedMatch[1].length < 50) {
      concepts.add(quotedMatch[1]);
    }
  }
  
  return Array.from(concepts).slice(0, 10); // Limit to top 10
}

/**
 * Calculate relevance score
 */
function calculateRelevance(text: string, topic: string): number {
  const textLower = text.toLowerCase();
  const topicWords = topic.toLowerCase().split(/\s+/);
  
  let matchCount = 0;
  for (const word of topicWords) {
    if (word.length > 3) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = textLower.match(regex);
      matchCount += matches ? matches.length : 0;
    }
  }
  
  // Normalize to 0-1 range
  return Math.min(1, matchCount / (topicWords.length * 2));
}

/**
 * Extract actionable skills from text
 */
export async function extractSkills(text: string, domain: string): Promise<any[]> {
  // This will be enhanced with AI in the fusion engine
  // For now, return empty array - skills extracted during fusion
  return [];
}
