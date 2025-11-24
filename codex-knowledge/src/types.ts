/**
 * Knowledge Engine v2 - Type Definitions
 */

import type { DomainKernel } from "./config.js";

export interface ResearchRequest {
  query: string;
  sources?: string[];          // URLs, file paths, etc.
  source?: string;             // Single source (convenience)
  content?: string;            // Pre-fetched content
  domain?: DomainKernel;       // Target domain kernel
  depth?: "shallow" | "medium" | "deep";
  sessionId?: string;
}

export interface ResearchResult {
  query: string;
  domain: DomainKernel | "unknown";
  summary: string;
  skills: ExtractedSkill[];
  chunks: Array<{ text: string; relevance: number; concepts: string[] }>;
  confidence: number;
  metadata: {
    depth: string;
    duration: number;
    chunkCount: number;
    skillCount: number;
    source?: string;
    mode: string;
  };
}

export interface ConceptChunk {
  id: string;
  text: string;
  topic: string;
  concepts: string[];
  relevance: number;
}

export interface ExtractedSkill {
  type: "rule" | "workflow" | "heuristic" | "pattern";
  domain: DomainKernel;
  title: string;
  description: string;
  steps?: string[];
  conditions?: string[];
  examples?: string[];
  confidence: number;
}

export interface FusionResponse {
  result: string;
  confidence: number;
  sources: Array<{
    provider: string;
    model: string;
    response: string;
    confidence: number;
  }>;
  consensus: boolean;
}

export interface DomainClassification {
  domain: DomainKernel | "unknown";
  confidence: number;
  reasoning: string;
}

export interface IngestRequest {
  url?: string;
  filePath?: string;
  content?: string;
  type: "youtube" | "web" | "pdf" | "audio" | "screenshot";
  domain?: DomainKernel;
}

export interface IngestResult {
  success: boolean;
  content: string;
  metadata: Record<string, any>;
  error?: string;
}
