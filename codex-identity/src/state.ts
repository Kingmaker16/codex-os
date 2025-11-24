import { IdentityRecord } from "./types.js";

export const identities: IdentityRecord[] = [];

export function addIdentity(i: IdentityRecord) {
  identities.push(i);
}

export function listIdentities() {
  return identities.slice();
}

export function getIdentity(id: string) {
  return identities.find(i => i.id === id);
}

export function getByProject(project: string) {
  return identities.filter(i => i.projectBinding === project);
}
