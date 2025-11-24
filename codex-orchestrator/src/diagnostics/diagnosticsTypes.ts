/**
 * Codex Diagnostics v1 - Type Definitions
 * 
 * Defines core types for the diagnostics system including test results,
 * reports, and auto-fix actions.
 */

export type DiagnosticStatus = "pass" | "fail" | "warn";

/**
 * Result of a single diagnostic test
 */
export interface DiagnosticTestResult {
  name: string;              // e.g. "bridge-openai-chat"
  component: string;         // e.g. "bridge", "hands", "voice", "trading"
  status: DiagnosticStatus;
  message: string;
  error?: string;
  startedAt: string;
  finishedAt: string;
}

/**
 * Complete diagnostics report for a run
 */
export interface DiagnosticsReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  results: DiagnosticTestResult[];
}

/**
 * Auto-fix action that can be executed to remediate failures
 */
export interface AutoFixAction {
  component: string;
  description: string;
  command: string[];  // e.g. ["npm", "run", "build"]
  cwd: string;
}

/**
 * Trading kill-switch decision
 */
export interface TradingKillDecision {
  soft: boolean;   // Pause trading temporarily
  hard: boolean;   // Lock trading permanently until manual intervention
  reason: string;
}
