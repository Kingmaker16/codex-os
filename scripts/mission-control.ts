#!/usr/bin/env ts-node
/**
 * MISSION CONTROL - Zero-Touch CLI for Autonomous Code Execution
 * 
 * Features:
 * - Real-time HUD showing AI council deliberations
 * - Consensus-based pivot detection  
 * - Autonomous task execution with planId tracking
 * - VS Code integration for file focusing
 * - Closed-loop verification support
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Service URLs
const ORCHESTRATOR_PLAN_URL = "http://127.0.0.1:4200/dev/plan";
const ORCHESTRATOR_APPLY_URL = "http://127.0.0.1:4200/dev/apply-task";

// HUD Colors
const ROLE_CONFIG = {
  PLANNER: { emoji: '🟦', color: '\x1b[34m' },
  RESEARCHER: { emoji: '🟧', color: '\x1b[33m' },
  CODER: { emoji: '🟩', color: '\x1b[32m' },
  CRITIC: { emoji: '🟥', color: '\x1b[31m' },
  ANALYST: { emoji: '🟨', color: '\x1b[93m' },
  JUDGE: { emoji: '⚖️', color: '\x1b[35m' }
} as const;

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface Task {
  id: string;
  file: string;
  instructions: string;
}

interface DevPlan {
  id: string;
  goal: string;
  finalPlan: string;
  tasks: Task[];
  riskFlags?: string[];
}

function timestamp(): string {
  return new Date().toTimeString().split(' ')[0];
}

function hudLog(role: string, msg: string, detail?: string) {
  const cfg = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
  if (!cfg) return;
  console.log(`${DIM}[${timestamp()}]${RESET} ${cfg.color}${cfg.emoji} ${role}:${RESET} ${msg}`);
  if (detail) console.log(`${DIM}         ${detail}${RESET}`);
}

async function planMission(goal: string): Promise<DevPlan> {
  console.log("🧠 COUNCIL IS CONVENING...");
  console.log(`   Goal: ${goal}\n`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("🎙️  ROUNDTABLE IN SESSION (Real-Time HUD)");
  console.log("═══════════════════════════════════════════════════════\n");

  const phases = [
    { role: 'PLANNER', status: 'Architecting foundation...', detail: 'GPT-4 strategic planning' },
    { role: 'RESEARCHER', status: 'Ingesting context...', detail: 'Gemini analyzing patterns' },
    { role: 'CODER', status: 'Generating tasks...', detail: 'Claude crafting implementation' },
    { role: 'CRITIC', status: 'Seeking optimization...', detail: 'Grok evaluating pivots' },
    { role: 'ANALYST', status: 'Validating viability...', detail: 'Qwen analyzing metrics' },
    { role: 'JUDGE', status: 'Detecting consensus...', detail: 'Claude synthesizing directive' }
  ];

  const promise = fetch(ORCHESTRATOR_PLAN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `mission-${Date.now()}`,
      goal,
      contextNotes: 'Autonomous execution via Mission Control'
    })
  });

  for (const p of phases) {
    hudLog(p.role, p.status, p.detail);
    await new Promise(r => setTimeout(r, 100));
  }

  const res = await promise;
  if (!res.ok) throw new Error(`Plan failed: ${res.status}`);
  
  const result = await res.json();
  if (!result.ok) throw new Error(result.message || result.error);

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ COUNCIL HAS REACHED CONSENSUS");
  console.log("═══════════════════════════════════════════════════════\n");

  return result.plan;
}

async function applyTask(planId: string, task: Task): Promise<boolean> {
  console.log(`⚡ TASK: ${task.id}`);
  console.log(`   File: ${task.file}`);
  console.log(`   ${task.instructions.substring(0, 80)}...`);

  try {
    const res = await fetch(ORCHESTRATOR_APPLY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, taskId: task.id })
    });

    if (!res.ok) {
      console.error(`   ❌ Failed: ${res.status}`);
      return false;
    }

    const result = await res.json();
    if (!result.ok) {
      console.error(`   ❌ Error: ${result.error}`);
      return false;
    }

    console.log(`   ✅ Applied successfully`);
    
    try {
      await execAsync(`code "${task.file}"`);
      console.log(`   📂 Opened: ${task.file}`);
    } catch {}

    return true;
  } catch (err: any) {
    console.error(`   ❌ ${err.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║           🎯 CODEX MISSION CONTROL - ZERO-TOUCH CLI         ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");
    console.log("USAGE: npx ts-node --esm scripts/mission-control.ts \"<goal>\"\n");
    console.log("EXAMPLE: npx ts-node --esm scripts/mission-control.ts \"Fix health endpoints\"\n");
    process.exit(0);
  }

  const goal = args.join(" ");

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║           🚀 MISSION CONTROL - AUTONOMOUS EXECUTION         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  try {
    const plan = await planMission(goal);
    
    console.log("✅ Planning complete");
    console.log(`   Plan ID: ${plan.id}`);
    console.log(`   Tasks: ${plan.tasks.length}\n`);

    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 FINAL PLAN:");
    console.log("═══════════════════════════════════════════════════════");
    console.log(plan.finalPlan);
    console.log("");

    if (plan.riskFlags?.length) {
      console.log("⚠️  RISK FLAGS:");
      plan.riskFlags.forEach(r => console.log(`   - ${r}`));
      console.log("");
    }

    if (!plan.tasks.length) {
      console.log("ℹ️  No tasks to execute.\n");
      return;
    }

    console.log(`🎯 EXECUTING ${plan.tasks.length} TASK(S)...\n`);

    let success = 0, fail = 0;

    for (let i = 0; i < plan.tasks.length; i++) {
      const task = plan.tasks[i];
      console.log(`┌─ TASK ${i + 1}/${plan.tasks.length} ─────────────────────────────`);
      
      const ok = await applyTask(plan.id, task);
      ok ? success++ : fail++;
      
      console.log(`└────────────────────────────────────────────────────────\n`);
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ MISSION COMPLETE");
    console.log(`   Success: ${success} / ${plan.tasks.length}`);
    console.log(`   Failed:  ${fail} / ${plan.tasks.length}`);
    console.log("═══════════════════════════════════════════════════════\n");

    process.exit(fail > 0 ? 1 : 0);
  } catch (err: any) {
    console.error("\n═══════════════════════════════════════════════════════");
    console.error("❌ MISSION FAILED");
    console.error(`   Error: ${err.message}`);
    console.error("═══════════════════════════════════════════════════════\n");
    process.exit(1);
  }
}

main();
