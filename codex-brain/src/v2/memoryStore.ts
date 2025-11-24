import { randomUUID } from "crypto";
import { MemoryRecord, MemoryWriteRequest, MemorySearchRequest, MemorySearchResult } from "./types.js";

// v2: Simple in-memory store for now (can be wired to SQLite later)
const memoryRecords: MemoryRecord[] = [];

export function writeMemory(req: MemoryWriteRequest): MemoryRecord {
  const rec: MemoryRecord = {
    id: randomUUID(),
    domain: req.domain,
    sessionId: req.sessionId,
    ts: new Date().toISOString(),
    title: req.title,
    content: req.content,
    tags: req.tags ?? [],
    importance: req.importance ?? 0.5
  };
  memoryRecords.push(rec);
  return rec;
}

export function searchMemory(req: MemorySearchRequest): MemorySearchResult {
  const { domain, query, limit = 10 } = req;

  const lower = query.toLowerCase();
  const filtered = memoryRecords.filter(rec => {
    if (domain && rec.domain !== domain) return false;
    return rec.content.toLowerCase().includes(lower) || (rec.title ?? "").toLowerCase().includes(lower);
  });

  // Simple heuristic: more recent + higher importance first
  const sorted = filtered.sort((a, b) => {
    const impDiff = (b.importance ?? 0.5) - (a.importance ?? 0.5);
    if (impDiff !== 0) return impDiff;
    return b.ts.localeCompare(a.ts);
  });

  return {
    results: sorted.slice(0, limit)
  };
}

export function getAllMemories(): MemoryRecord[] {
  return memoryRecords.slice();
}
