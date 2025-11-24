export type BrainDomain =
  | "social"
  | "ecomm"
  | "creative"
  | "strategy"
  | "trend"
  | "ops"
  | "system"
  | "monetization";

export interface MemoryRecord {
  id: string;
  domain: BrainDomain;
  sessionId: string;
  ts: string;
  title?: string;
  content: string;
  tags?: string[];
  importance?: number; // 0-1
}

export interface MemoryWriteRequest {
  domain: BrainDomain;
  sessionId: string;
  title?: string;
  content: string;
  tags?: string[];
  importance?: number;
}

export interface MemorySearchRequest {
  domain?: BrainDomain;
  query: string;
  limit?: number;
}

export interface MemorySearchResult {
  results: MemoryRecord[];
}
