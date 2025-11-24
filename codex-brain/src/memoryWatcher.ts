/**
 * Memory Growth Monitor
 * 
 * Watches codex-brain.db file size every 60 seconds.
 * If DB grows by >50KB, triggers auto-backup.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODEX_ROOT = path.resolve(__dirname, "..", "..");
const DB_PATH = path.join(CODEX_ROOT, "codex-brain", "codex-brain-data", "codex-brain.db");
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds
const GROWTH_THRESHOLD_KB = 50;

let lastSize = 0;
let isBackupRunning = false;

function getDbSize(): number {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return 0;
    }
    const stats = fs.statSync(DB_PATH);
    return stats.size;
  } catch (err) {
    console.error("[Memory Watcher] Failed to stat DB:", err);
    return 0;
  }
}

function triggerBackup(growthKB: number) {
  if (isBackupRunning) {
    console.log("[Memory Watcher] Backup already running, skipping...");
    return;
  }

  console.log(`[Memory Watcher] Brain grew by ${growthKB.toFixed(2)} KB, creating auto-backup`);
  isBackupRunning = true;

  const proc = spawn("node", ["scripts/codexAutoBackup.js"], {
    cwd: CODEX_ROOT,
    stdio: "inherit",
  });

  proc.on("exit", (code) => {
    isBackupRunning = false;
    console.log(`[Memory Watcher] Backup completed (exit ${code})`);
  });

  proc.on("error", (err) => {
    isBackupRunning = false;
    console.error("[Memory Watcher] Backup failed:", err);
  });
}

function checkMemoryGrowth() {
  const currentSize = getDbSize();

  if (lastSize === 0) {
    // First check, initialize
    lastSize = currentSize;
    console.log(`[Memory Watcher] Initial DB size: ${(currentSize / 1024).toFixed(2)} KB`);
    return;
  }

  const growthBytes = currentSize - lastSize;
  const growthKB = growthBytes / 1024;

  if (growthKB > GROWTH_THRESHOLD_KB) {
    triggerBackup(growthKB);
    lastSize = currentSize;
  } else if (growthBytes > 0) {
    // Log small growth for monitoring
    console.log(`[Memory Watcher] DB grew by ${growthKB.toFixed(2)} KB (under threshold)`);
    lastSize = currentSize;
  }
}

export function startMemoryWatcher() {
  console.log(`[Memory Watcher] Starting (check every ${CHECK_INTERVAL_MS / 1000}s, threshold: ${GROWTH_THRESHOLD_KB} KB)`);
  
  // Initial check
  checkMemoryGrowth();

  // Set up periodic checks
  setInterval(() => {
    checkMemoryGrowth();
  }, CHECK_INTERVAL_MS);
}
