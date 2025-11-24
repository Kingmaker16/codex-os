export type OrchestratorMode = "SIMULATION" | "DRY_RUN" | "LIVE";

export function resolveMode(mode?: string): OrchestratorMode {
  if (!mode) return "LIVE";
  const upper = mode.toUpperCase();
  if (upper === "SIMULATION" || upper === "DRY_RUN" || upper === "LIVE") {
    return upper as OrchestratorMode;
  }
  return "LIVE";
}
