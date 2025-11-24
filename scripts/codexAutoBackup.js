#!/usr/bin/env node

/**
 * Codex Auto-Backup v1.5
 * 
 * Creates timestamped snapshots of:
 * - Brain database (codex-brain.db)
 * - All service code (tar.gz archive)
 * 
 * Triggered by:
 * - Boot Manager (after successful boot)
 * - Memory Growth Monitor (when brain.db grows >50KB)
 * - Manual: npm run codex:backup
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODEX_ROOT = path.resolve(__dirname, "..");
const BRAIN_DB_PATH = path.join(CODEX_ROOT, "codex-brain", "codex-brain-data", "codex-brain.db");
const BACKUPS_DIR = path.join(CODEX_ROOT, "backups");

// Build timestamp string
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const SNAPSHOT_DIR = path.join(BACKUPS_DIR, `codex-backup-${stamp}`);

console.log(`[Auto-Backup v1.5] Starting backup at ${new Date().toISOString()}`);

// Create snapshot directory
try {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  console.log(`[Auto-Backup] Created snapshot directory: ${SNAPSHOT_DIR}`);
} catch (err) {
  console.error("[Auto-Backup] Failed to create snapshot directory:", err);
  process.exit(1);
}

// Copy Brain DB file
try {
  if (fs.existsSync(BRAIN_DB_PATH)) {
    const destPath = path.join(SNAPSHOT_DIR, "codex-brain.db");
    fs.copyFileSync(BRAIN_DB_PATH, destPath);
    const stats = fs.statSync(destPath);
    console.log(`[Auto-Backup] Copied Brain DB (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.warn("[Auto-Backup] Warning: Brain DB not found at", BRAIN_DB_PATH);
  }
} catch (err) {
  console.error("[Auto-Backup] Failed to copy Brain DB:", err);
  process.exit(1);
}

// Create tar.gz archive of code
const TAR_PATH = path.join(SNAPSHOT_DIR, "codex-code.tar.gz");
const CODE_DIRS = [
  "codex-brain",
  "codex-bridge",
  "codex-orchestrator",
  "codex-hands",
  "codex-voice",
  "codex-desktop",
  "codex-boot-manager",
  "packages",
  "package.json"
].filter(item => {
  const itemPath = path.join(CODEX_ROOT, item);
  return fs.existsSync(itemPath);
});

console.log("[Auto-Backup] Creating code archive...");

const tarArgs = ["-czf", TAR_PATH, ...CODE_DIRS];
const tar = spawn("tar", tarArgs, { cwd: CODEX_ROOT });

let tarError = "";
tar.stderr.on("data", (data) => {
  tarError += data.toString();
});

tar.on("close", (code) => {
  if (code !== 0) {
    console.error("[Auto-Backup] tar failed with code", code);
    if (tarError) console.error(tarError);
    process.exit(1);
  }

  try {
    const stats = fs.statSync(TAR_PATH);
    console.log(`[Auto-Backup] Created code archive (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`[Auto-Backup] ✓ Auto-backup completed: ${SNAPSHOT_DIR}`);
  } catch (err) {
    console.error("[Auto-Backup] Failed to stat archive:", err);
    process.exit(1);
  }
});

tar.on("error", (err) => {
  console.error("[Auto-Backup] Failed to spawn tar:", err);
  process.exit(1);
});
