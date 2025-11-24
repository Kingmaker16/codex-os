/**
 * Codex Stability Layer - Trading Guard
 * 
 * Kill-switch integration for trading operations
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const LOCK_FILE = "/Users/amar/Codex/.codex-trading-lock";

export interface TradingKillState {
  soft: boolean;    // Pause trading, allow manual override
  hard: boolean;    // Full stop, no trading allowed
  reason?: string;
  updatedAt: string;
  triggeredBy?: string;
}

/**
 * Read current trading kill state
 */
export function readTradingKillState(): TradingKillState | null {
  try {
    if (!existsSync(LOCK_FILE)) {
      return null;
    }
    const content = readFileSync(LOCK_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("[TradingGuard] Failed to read lock file:", err);
    return null;
  }
}

/**
 * Apply soft kill (pause trading)
 */
export async function applyTradingKillSoft(reason: string): Promise<void> {
  const state: TradingKillState = {
    soft: true,
    hard: false,
    reason,
    updatedAt: new Date().toISOString(),
    triggeredBy: "codex-stability"
  };
  
  try {
    writeFileSync(LOCK_FILE, JSON.stringify(state, null, 2));
    console.log(`[TradingGuard] Soft kill applied: ${reason}`);
  } catch (err) {
    console.error("[TradingGuard] Failed to apply soft kill:", err);
  }
}

/**
 * Apply hard kill (full stop)
 */
export async function applyTradingKillHard(reason: string): Promise<void> {
  const state: TradingKillState = {
    soft: true,
    hard: true,
    reason,
    updatedAt: new Date().toISOString(),
    triggeredBy: "codex-stability"
  };
  
  try {
    writeFileSync(LOCK_FILE, JSON.stringify(state, null, 2));
    console.log(`[TradingGuard] Hard kill applied: ${reason}`);
  } catch (err) {
    console.error("[TradingGuard] Failed to apply hard kill:", err);
  }
}

/**
 * Clear trading kill (resume trading)
 */
export async function clearTradingKill(): Promise<void> {
  try {
    if (existsSync(LOCK_FILE)) {
      writeFileSync(LOCK_FILE, JSON.stringify({
        soft: false,
        hard: false,
        reason: "Cleared by stability layer",
        updatedAt: new Date().toISOString()
      }, null, 2));
      console.log("[TradingGuard] Trading kill cleared");
    }
  } catch (err) {
    console.error("[TradingGuard] Failed to clear kill:", err);
  }
}

/**
 * Check if trading is currently blocked
 */
export function isTradingBlocked(): boolean {
  const state = readTradingKillState();
  return state ? (state.soft || state.hard) : false;
}
