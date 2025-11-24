import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { Finding } from "../types.js";

const BRAIN_URL = "http://localhost:4100";

export async function validateConsistency(
  content: string,
  sessionId: string,
  relatedMemories?: string[]
): Promise<Finding[]> {
  const findings: Finding[] = [];

  try {
    // Query Brain for related memories
    const resp = await fetch(BRAIN_URL + "/v2/memory/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: content.slice(0, 200),
        limit: 5
      })
    });

    const data = await resp.json() as any;

    if (data.memories && data.memories.length > 0) {
      // Simple consistency check: look for conflicting statements
      for (const memory of data.memories) {
        const memoryContent = memory.content || "";
        
        // Check for contradicting keywords
        const hasPositive = /\b(enable|allow|yes|approved|safe)\b/i.test(content);
        const hasNegative = /\b(disable|deny|no|rejected|unsafe)\b/i.test(content);
        const memHasPositive = /\b(enable|allow|yes|approved|safe)\b/i.test(memoryContent);
        const memHasNegative = /\b(disable|deny|no|rejected|unsafe)\b/i.test(memoryContent);

        if ((hasPositive && memHasNegative) || (hasNegative && memHasPositive)) {
          findings.push({
            id: uuidv4(),
            type: "INCONSISTENCY",
            severity: "MEDIUM",
            confidence: 0.6,
            description: "Content may conflict with historical decision",
            context: `Related memory: ${memory.title || "untitled"}`
          });
        }
      }
    }

    // Check temporal consistency
    const datePattern = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
    const dates: Date[] = [];
    let match;

    while ((match = datePattern.exec(content)) !== null) {
      dates.push(new Date(`${match[1]}-${match[2]}-${match[3]}`));
    }

    if (dates.length > 1) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        if (dates[i + 1].getTime() < dates[i].getTime()) {
          findings.push({
            id: uuidv4(),
            type: "TEMPORAL_MISMATCH",
            severity: "MEDIUM",
            confidence: 0.75,
            description: "Temporal inconsistency detected in dates"
          });
          break;
        }
      }
    }

  } catch (err) {
    // Brain unavailable - skip consistency check
  }

  return findings;
}
