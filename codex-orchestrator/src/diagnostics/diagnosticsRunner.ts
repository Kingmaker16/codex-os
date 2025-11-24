/**
 * Codex Diagnostics v1 - Runner Engine
 * 
 * Implements active testing of all Codex subsystems with:
 * - Real action-based tests
 * - Brain logging integration
 * - Auto-fix capabilities (D3)
 * - Trading kill-switch logic (K3)
 */

import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";

import type {
  DiagnosticsReport,
  DiagnosticTestResult,
  AutoFixAction,
  TradingKillDecision
} from "./diagnosticsTypes.js";

// Constants
const DIAGNOSTICS_SESSION_ID = "codex-diagnostics";
const CODEX_ROOT = "/Users/amar/Codex";
const TRADING_LOCK_FILE = path.join(CODEX_ROOT, ".codex-trading-lock");
const DIAGNOSTICS_STATE_FILE = path.join(CODEX_ROOT, ".codex-diagnostics-state.json");

// Track consecutive failures for hard kill logic
interface DiagnosticsState {
  lastRunId?: string;
  consecutiveTradingFailures: number;
  lastRunTimestamp?: string;
}

// =====================================================
// INDIVIDUAL TEST FUNCTIONS
// =====================================================

/**
 * Test Bridge - OpenAI provider
 */
async function testBridgeOpenAI(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const resp = await fetch("http://localhost:4000/respond?provider=openai&model=gpt-4o", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Diagnostics: say 'OK'." }],
        max_tokens: 5
      }),
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "bridge-openai-chat",
        component: "bridge",
        status: "fail",
        message: `HTTP ${resp.status}`,
        error: await resp.text().catch(() => ""),
        startedAt,
        finishedAt
      };
    }
    
    await resp.json().catch(() => null);
    
    return {
      name: "bridge-openai-chat",
      component: "bridge",
      status: "pass",
      message: "OpenAI provider responded successfully.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "bridge-openai-chat",
      component: "bridge",
      status: "fail",
      message: "Exception thrown during test.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Brain - Health check
 */
async function testBrainHealth(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const resp = await fetch("http://localhost:4100/health", {
      method: "GET",
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "brain-health",
        component: "brain",
        status: "fail",
        message: `HTTP ${resp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    const data = await resp.json().catch(() => ({})) as any;
    
    return {
      name: "brain-health",
      component: "brain",
      status: "pass",
      message: `Brain responding. Service: ${data.service || "codex-brain"}`,
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "brain-health",
      component: "brain",
      status: "fail",
      message: "Brain health check failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Brain - Memory storage/retrieval
 */
async function testBrainMemory(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const resp = await fetch(`http://localhost:4100/memory?sessionId=${DIAGNOSTICS_SESSION_ID}`, {
      method: "GET",
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "brain-memory",
        component: "brain",
        status: "fail",
        message: `HTTP ${resp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "brain-memory",
      component: "brain",
      status: "pass",
      message: "Memory retrieval working.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "brain-memory",
      component: "brain",
      status: "fail",
      message: "Memory test failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Hands - File operations
 */
async function testHandsFileOps(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    // Test file creation
    const testFileName = `diagnostics-test-${Date.now()}.txt`;
    const createResp = await fetch("http://localhost:4300/hands/file/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: DIAGNOSTICS_SESSION_ID,
        relativePath: testFileName,
        content: "Diagnostics test file"
      }),
    });
    
    if (!createResp.ok) {
      const finishedAt = new Date().toISOString();
      return {
        name: "hands-file-ops",
        component: "hands",
        status: "fail",
        message: `File create failed: HTTP ${createResp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    // Test file deletion
    const deleteResp = await fetch("http://localhost:4300/hands/file/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: DIAGNOSTICS_SESSION_ID,
        relativePath: testFileName
      }),
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!deleteResp.ok) {
      return {
        name: "hands-file-ops",
        component: "hands",
        status: "warn",
        message: "File create OK, but delete failed.",
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "hands-file-ops",
      component: "hands",
      status: "pass",
      message: "File create/delete operations successful.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "hands-file-ops",
      component: "hands",
      status: "fail",
      message: "File operations test failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Hands - Web automation
 */
async function testHandsWeb(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const resp = await fetch("http://localhost:4300/hands/web/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: DIAGNOSTICS_SESSION_ID,
        url: "https://www.google.com"
      }),
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "hands-web-automation",
        component: "hands",
        status: "fail",
        message: `HTTP ${resp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "hands-web-automation",
      component: "hands",
      status: "pass",
      message: "Web automation (Playwright) working.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "hands-web-automation",
      component: "hands",
      status: "fail",
      message: "Web automation test failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Voice - Health check
 */
async function testVoiceHealth(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const resp = await fetch("http://localhost:4400/health", {
      method: "GET",
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "voice-health",
        component: "voice",
        status: "fail",
        message: `HTTP ${resp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "voice-health",
      component: "voice",
      status: "pass",
      message: "Voice service responding.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "voice-health",
      component: "voice",
      status: "fail",
      message: "Voice health check failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Vision - Solver endpoint
 */
async function testVisionSolver(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    // Minimal test with small base64 image (1x1 transparent PNG)
    const minimalImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const resp = await fetch("http://localhost:4200/vision/solveCaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: minimalImage,
        instructions: "Diagnostics test"
      }),
    });
    
    const finishedAt = new Date().toISOString();
    
    if (!resp.ok) {
      return {
        name: "vision-solver",
        component: "vision",
        status: "fail",
        message: `HTTP ${resp.status}`,
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "vision-solver",
      component: "vision",
      status: "pass",
      message: "Vision solver endpoint responding.",
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "vision-solver",
      component: "vision",
      status: "fail",
      message: "Vision solver test failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

/**
 * Test Backup - Check for backup presence
 */
async function testBackupPresence(): Promise<DiagnosticTestResult> {
  const startedAt = new Date().toISOString();
  try {
    const backupDir = path.join(CODEX_ROOT, "backups");
    const entries = await fs.readdir(backupDir).catch(() => []);
    
    const finishedAt = new Date().toISOString();
    
    const backupFolders = entries.filter(e => e.startsWith("codex-backup-"));
    
    if (backupFolders.length === 0) {
      return {
        name: "backup-presence",
        component: "backup",
        status: "warn",
        message: "No backup folders found.",
        startedAt,
        finishedAt
      };
    }
    
    return {
      name: "backup-presence",
      component: "backup",
      status: "pass",
      message: `Found ${backupFolders.length} backup folder(s).`,
      startedAt,
      finishedAt
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    return {
      name: "backup-presence",
      component: "backup",
      status: "fail",
      message: "Backup check failed.",
      error: String(err?.message ?? err),
      startedAt,
      finishedAt
    };
  }
}

// =====================================================
// BRAIN LOGGING
// =====================================================

/**
 * Log diagnostics report to Brain for persistence
 */
async function logReportToBrain(report: DiagnosticsReport): Promise<void> {
  try {
    await fetch("http://localhost:4100/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId: DIAGNOSTICS_SESSION_ID,
          role: "system",
          text: JSON.stringify(report),
          ts: new Date().toISOString()
        }
      }),
    });
  } catch (err) {
    // Silent fail - don't break diagnostics if Brain logging fails
    console.error("Failed to log diagnostics to Brain:", err);
  }
}

// =====================================================
// AUTO-FIX LAYER (D3)
// =====================================================

/**
 * Suggest auto-fix actions based on test failures
 */
function suggestAutoFixes(results: DiagnosticTestResult[]): AutoFixAction[] {
  const fixes: AutoFixAction[] = [];
  
  for (const res of results) {
    if (res.status === "fail") {
      switch (res.component) {
        case "bridge":
          fixes.push({
            component: "bridge",
            description: "Rebuild codex-bridge.",
            command: ["npm", "run", "build"],
            cwd: path.join(CODEX_ROOT, "codex-bridge")
          });
          break;
          
        case "hands":
          fixes.push({
            component: "hands",
            description: "Rebuild codex-hands.",
            command: ["npm", "run", "build"],
            cwd: path.join(CODEX_ROOT, "codex-hands")
          });
          break;
          
        case "voice":
          fixes.push({
            component: "voice",
            description: "Rebuild codex-voice.",
            command: ["npm", "run", "build"],
            cwd: path.join(CODEX_ROOT, "codex-voice")
          });
          break;
          
        case "brain":
          fixes.push({
            component: "brain",
            description: "Rebuild codex-brain.",
            command: ["npm", "run", "build"],
            cwd: path.join(CODEX_ROOT, "codex-brain")
          });
          break;
          
        case "vision":
          fixes.push({
            component: "orchestrator",
            description: "Rebuild codex-orchestrator (vision module).",
            command: ["npm", "run", "build"],
            cwd: path.join(CODEX_ROOT, "codex-orchestrator")
          });
          break;
      }
    }
  }
  
  return fixes;
}

/**
 * Execute auto-fix actions
 */
export async function runAutoFixes(actions: AutoFixAction[]): Promise<void> {
  for (const action of actions) {
    console.log(`[Auto-Fix] ${action.description}`);
    
    try {
      const proc = spawn(action.command[0], action.command.slice(1), {
        cwd: action.cwd,
        stdio: "ignore"
      });
      
      await new Promise<void>((resolve) => {
        proc.on("exit", () => resolve());
        proc.on("error", () => resolve());
        
        // Timeout after 60 seconds
        setTimeout(() => {
          proc.kill();
          resolve();
        }, 60000);
      });
    } catch (err) {
      console.error(`[Auto-Fix] Failed: ${action.description}`, err);
    }
  }
}

// =====================================================
// TRADING KILL-SWITCH (K3)
// =====================================================

/**
 * Load diagnostics state from disk
 */
async function loadDiagnosticsState(): Promise<DiagnosticsState> {
  try {
    const data = await fs.readFile(DIAGNOSTICS_STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {
      consecutiveTradingFailures: 0
    };
  }
}

/**
 * Save diagnostics state to disk
 */
async function saveDiagnosticsState(state: DiagnosticsState): Promise<void> {
  try {
    await fs.writeFile(DIAGNOSTICS_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save diagnostics state:", err);
  }
}

/**
 * Determine if trading kill-switch should be activated
 */
async function needsTradingKill(report: DiagnosticsReport): Promise<TradingKillDecision> {
  const state = await loadDiagnosticsState();
  
  // Check for trading component failures
  const tradingFailures = report.results.filter(
    r => r.component === "trading" && r.status === "fail"
  );
  
  if (tradingFailures.length === 0) {
    // Reset consecutive failures
    state.consecutiveTradingFailures = 0;
    state.lastRunId = report.runId;
    state.lastRunTimestamp = report.finishedAt;
    await saveDiagnosticsState(state);
    
    return {
      soft: false,
      hard: false,
      reason: "No trading failures detected."
    };
  }
  
  // Trading test(s) failed
  state.consecutiveTradingFailures += 1;
  state.lastRunId = report.runId;
  state.lastRunTimestamp = report.finishedAt;
  await saveDiagnosticsState(state);
  
  // Soft kill: First failure
  if (state.consecutiveTradingFailures === 1) {
    return {
      soft: true,
      hard: false,
      reason: "First trading failure detected. Soft pause initiated."
    };
  }
  
  // Hard kill: 2+ consecutive failures
  if (state.consecutiveTradingFailures >= 2) {
    // Write lock file
    try {
      await fs.writeFile(
        TRADING_LOCK_FILE,
        JSON.stringify({
          locked: true,
          reason: "Multiple consecutive trading test failures",
          timestamp: new Date().toISOString(),
          runId: report.runId
        }, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.error("Failed to write trading lock file:", err);
    }
    
    return {
      soft: false,
      hard: true,
      reason: `${state.consecutiveTradingFailures} consecutive trading failures. Hard kill activated.`
    };
  }
  
  return {
    soft: false,
    hard: false,
    reason: "Unknown state."
  };
}

// =====================================================
// MAIN DIAGNOSTICS SUITE
// =====================================================

/**
 * Run complete diagnostics suite
 */
export async function runDiagnosticsSuite(): Promise<DiagnosticsReport> {
  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const results: DiagnosticTestResult[] = [];
  
  console.log(`[Diagnostics] Starting run ${runId}...`);
  
  // Run all tests
  results.push(await testBridgeOpenAI());
  results.push(await testBrainHealth());
  results.push(await testBrainMemory());
  results.push(await testHandsFileOps());
  results.push(await testHandsWeb());
  results.push(await testVoiceHealth());
  results.push(await testVisionSolver());
  results.push(await testBackupPresence());
  
  const finishedAt = new Date().toISOString();
  
  const report: DiagnosticsReport = {
    runId,
    startedAt,
    finishedAt,
    results
  };
  
  // Log to Brain
  await logReportToBrain(report);
  
  // Check for auto-fixes
  const fixes = suggestAutoFixes(results);
  if (fixes.length > 0) {
    console.log(`[Diagnostics] ${fixes.length} auto-fix action(s) suggested.`);
    // Optionally: await runAutoFixes(fixes);
  }
  
  // Check trading kill-switch
  const killDecision = await needsTradingKill(report);
  if (killDecision.soft || killDecision.hard) {
    console.log(`[Diagnostics] Trading kill-switch: ${killDecision.reason}`);
    // TODO: POST to trader pause endpoint when trading module exists
  }
  
  // Summary
  const passCount = results.filter(r => r.status === "pass").length;
  const failCount = results.filter(r => r.status === "fail").length;
  const warnCount = results.filter(r => r.status === "warn").length;
  
  console.log(`[Diagnostics] Run ${runId} complete: ${passCount} pass, ${failCount} fail, ${warnCount} warn`);
  
  return report;
}
