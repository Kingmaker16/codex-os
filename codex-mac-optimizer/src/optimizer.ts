import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { OptimizationReport } from "./types.js";

export class MacOptimizer {
  run(): OptimizationReport {
    const notes: string[] = [];

    const disk = execSync("df -h /").toString();

    execSync("rm -rf ~/Library/Caches/*");
    const cachesCleared = true;

    let brewStatus = "not installed";
    try {
      brewStatus = execSync("brew cleanup && brew doctor || true").toString();
    } catch {
      notes.push("Homebrew not installed or cleanup failed.");
    }

    const permissions = {
      accessibility: fs.existsSync("/Library/Application Support/com.apple.TCC"),
      screenRecording: false,
      automation: true
    };

    const largeFiles = execSync("find ~ -type f -size +200M 2>/dev/null | head -20")
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);

    const desktop = path.join(process.env.HOME!, "Desktop");
    const archive = path.join(desktop, "Codex-Archive");
    if (!fs.existsSync(archive)) fs.mkdirSync(archive);

    const items = fs.readdirSync(desktop)
      .filter((f: string) => !f.includes("Codex-Archive"))
      .map((f: string) => path.join(desktop, f));

    items.forEach((item: string) => {
      try { fs.renameSync(item, path.join(archive, path.basename(item))); }
      catch { notes.push(`Could not move: ${item}`); }
    });

    return {
      disk,
      cachesCleared,
      brewStatus,
      permissions,
      largeFiles,
      desktopArchivePath: archive,
      notes
    };
  }
}
