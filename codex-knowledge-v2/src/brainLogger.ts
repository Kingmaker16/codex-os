/**
 * Knowledge Engine v2.5 - Brain Logger
 * 
 * Logs all knowledge operations to Brain for audit trail
 * Sessions: codex-knowledge-log, codex-knowledge-[domain], codex-knowledge-sessions
 */

import { CONFIG } from "./config.js";

const BRAIN_URL = CONFIG.brainUrl;

export async function logToKnowledge(sessionId: string, entry: any): Promise<void> {
  if (!CONFIG.c1Rules.auditLogging) return;

  try {
    await fetch(`${BRAIN_URL}/brain/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        entry: typeof entry === "string" ? entry : JSON.stringify(entry, null, 2)
      })
    });
  } catch (error) {
    console.warn(`[BrainLogger] Failed to log to ${sessionId}:`, error);
  }
}

export async function logResearch(query: string, result: any): Promise<void> {
  await logToKnowledge("codex-knowledge-log", {
    type: "research",
    timestamp: new Date().toISOString(),
    query,
    domain: result.domain,
    success: result.success,
    knowledgeBlocks: result.knowledge?.length || 0,
    skills: result.skills?.length || 0,
    confidence: result.confidence
  });
}

export async function logDomainKnowledge(domain: string, knowledge: any): Promise<void> {
  await logToKnowledge(`codex-knowledge-${domain}`, {
    type: "knowledge_update",
    timestamp: new Date().toISOString(),
    knowledge
  });
}

export async function logSession(sessionId: string, event: any): Promise<void> {
  await logToKnowledge("codex-knowledge-sessions", {
    sessionId,
    timestamp: new Date().toISOString(),
    event
  });
}
