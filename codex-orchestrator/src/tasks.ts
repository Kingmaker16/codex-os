import { spawn } from "node:child_process";
import path from "path";
import { fileURLToPath } from "url";

export interface TaskResult {
  status: "success" | "failure";
  logs: string;
}

export async function runBuildService(name: string): Promise<TaskResult> {
  if (!name || typeof name !== "string") throw new Error("invalid name");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // workspace root is two levels up from src/
  const workspaceRoot = path.resolve(__dirname, "..", "..");

  return new Promise((resolve) => {
    const parts: string[] = [];
    // Spawn the codex CLI
    const child = spawn("codex", ["scaffold", "service", name], { cwd: workspaceRoot });

    child.stdout.on("data", (chunk: Buffer) => {
      parts.push(chunk.toString());
    });
    child.stderr.on("data", (chunk: Buffer) => {
      parts.push(chunk.toString());
    });

    child.on("error", (err) => {
      parts.push(`error: ${err.message}`);
    });

    child.on("close", (code) => {
      const logs = parts.join("");
      const status = code === 0 ? "success" : "failure";
      resolve({ status, logs });
    });
  });
}
