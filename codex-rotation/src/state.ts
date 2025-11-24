import { AccountRiskSnapshot, VisibilitySnapshot } from "./types.js";

let lastRisk: AccountRiskSnapshot[] = [];
let lastVis: VisibilitySnapshot[] = [];

export function setRiskSnapshots(snapshots: AccountRiskSnapshot[]) {
  lastRisk = snapshots;
}

export function setVisibilitySnapshots(snapshots: VisibilitySnapshot[]) {
  lastVis = snapshots;
}

export function getRiskSnapshots(): AccountRiskSnapshot[] {
  return lastRisk;
}

export function getVisibilitySnapshots(): VisibilitySnapshot[] {
  return lastVis;
}
