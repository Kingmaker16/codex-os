import { AutonomyMemoryRecord } from "./types.js";

const records: AutonomyMemoryRecord[] = [];

export function addRecord(rec: AutonomyMemoryRecord) {
  records.push(rec);
}

export function listRecords(limit: number = 50): AutonomyMemoryRecord[] {
  return records.slice(-limit).reverse();
}

export function filterByDomain(domain: string): AutonomyMemoryRecord[] {
  return records.filter(r => r.domain.includes(domain));
}

export function filterByOutcome(outcome: string): AutonomyMemoryRecord[] {
  return records.filter(r => r.outcome === outcome);
}
