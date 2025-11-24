import { ProfileRecord } from "./types.js";

export const profiles: ProfileRecord[] = [];

export function addProfile(p: ProfileRecord) {
  profiles.push(p);
}

export function getProfile(id: string): ProfileRecord | undefined {
  return profiles.find(p => p.id === id);
}

export function listProfiles(): ProfileRecord[] {
  return profiles.slice();
}
