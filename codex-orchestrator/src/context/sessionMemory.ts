/**
 * Session Memory - Orchestrator Intelligence v2.0
 * 
 * Manages per-session state to reduce Brain chatter.
 * Future: Persist critical state to Brain for recovery.
 */

// In-memory session state
const sessionStore = new Map<string, any>();

/**
 * Get session state by ID
 */
export function getSessionState(sessionId: string): any {
  return sessionStore.get(sessionId) || {};
}

/**
 * Update session state with partial data
 */
export function updateSessionState(sessionId: string, patch: any): void {
  const current = getSessionState(sessionId);
  const updated = { ...current, ...patch };
  sessionStore.set(sessionId, updated);
}

/**
 * Clear session state
 */
export function clearSessionState(sessionId: string): void {
  sessionStore.delete(sessionId);
}

/**
 * Get all session IDs
 */
export function getAllSessionIds(): string[] {
  return Array.from(sessionStore.keys());
}

/**
 * Store a task graph in session memory
 */
export function storeTaskGraph(sessionId: string, graphId: string, graph: any): void {
  const state = getSessionState(sessionId);
  const graphs = state.graphs || {};
  graphs[graphId] = graph;
  updateSessionState(sessionId, { graphs });
}

/**
 * Retrieve a task graph from session memory
 */
export function getTaskGraph(sessionId: string, graphId: string): any | undefined {
  const state = getSessionState(sessionId);
  const graphs = state.graphs || {};
  return graphs[graphId];
}

/**
 * Get all task graphs for a session
 */
export function getAllTaskGraphs(sessionId: string): Record<string, any> {
  const state = getSessionState(sessionId);
  return state.graphs || {};
}

/**
 * TODO: Persist critical session state to Brain for recovery
 * This would allow recovering orchestration workflows after restarts.
 */
export async function persistSessionToBrain(sessionId: string): Promise<void> {
  // Future implementation:
  // - POST to Brain with sessionId: "codex-orchestrator-sessions"
  // - Include graph state, execution history, etc.
  // - Enable recovery after service restart
}
