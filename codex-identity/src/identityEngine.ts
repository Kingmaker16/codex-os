import { v4 as uuidv4 } from "uuid";
import { Platform, RiskTier, IdentityRecord } from "./types.js";
import { generatePersona } from "./personaGenerator.js";
import { addIdentity, listIdentities, getByProject } from "./state.js";
import { fetchProfileId } from "./integrations/profilesClient.js";

export async function createIdentity(
  platform: Platform,
  niche: string,
  risk: RiskTier,
  project?: string
): Promise<IdentityRecord> {
  const profile = await fetchProfileId(platform, niche);

  if (!profile) {
    throw new Error(
      "No profile matching niche/platform found. Create profile first via codex-profiles."
    );
  }

  const identity: IdentityRecord = {
    id: uuidv4(),
    profileId: profile.id,
    platform,
    niche,
    persona: generatePersona(niche),
    riskTier: risk,
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
    projectBinding: project
  };

  addIdentity(identity);
  return identity;
}

export function listAllIdentities() {
  return listIdentities();
}

export function listForProject(project: string) {
  return getByProject(project);
}
