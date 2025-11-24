/**
 * Knowledge Engine v2.5 - Type Definitions
 */

import type { Domain as ConfigDomain } from "./config.js";

export type Domain = ConfigDomain;

export interface ResearchRequest {
  query: string;
  domain?: Domain;
  sources?: string[];  // URLs, file paths, etc.
  depth?: "shallow" | "medium" | "deep";
}

export interface ResearchResult {
  success: boolean;
  query: string;
  domain: Domain;
  knowledge: KnowledgeBlock[];
  summary: string;
  skills: ExtractedSkill[];
  confidence: number;
  sources: string[];
  timestamp: string;
}

export interface KnowledgeBlock {
  id: string;
  domain: Domain;
  content: string;
  summary: string;
  keywords: string[];
  relations: string[];  // IDs of related blocks
  confidence: number;
  source: string;
  timestamp: string;
}

export interface ExtractedSkill {
  name: string;
  domain: Domain;
  rule: string;
  examples: string[];
  confidence: number;
  applicability: string[];  // When to use this skill
}

export interface FusionRequest {
  prompt: string;
  context?: string;
  providers?: string[];
}

export interface FusionResult {
  result: string;
  confidence: number;
  sources: FusionSource[];
  consensus: boolean;
  timestamp: string;
}

export interface FusionSource {
  provider: string;
  model: string;
  response: string;
  confidence: number;
  latency: number;
}

export interface IngestedContent {
  type: "web" | "pdf" | "youtube" | "audio" | "screenshot";
  source: string;
  rawContent: string;
  chunks: ContentChunk[];
  metadata: Record<string, any>;
}

export interface ContentChunk {
  id: string;
  content: string;
  index: number;
  tokens: number;
}

export interface DomainKernel {
  domain: Domain;
  knowledge: KnowledgeBlock[];
  skills: ExtractedSkill[];
  relations: KnowledgeRelation[];
}

export interface KnowledgeRelation {
  from: string;  // Knowledge block ID
  to: string;    // Knowledge block ID
  type: "similar" | "prerequisite" | "applies-to" | "contradicts";
  strength: number;
}

export interface ClassificationResult {
  domain: Domain;
  confidence: number;
  reasoning: string;
}
