import { ProfileCreateRequest, ProfileRecord } from "./types.js";
import { buildProfile } from "./generator.js";
import { addProfile, listProfiles, getProfile } from "./state.js";
import { storeProfileCredentials } from "./integrations/vaultClient.js";
import { registerAccountSafety } from "./integrations/accountSafetyClient.js";
import { logProfileToBrain } from "./integrations/brainClient.js";

export async function createProfile(req: ProfileCreateRequest): Promise<ProfileRecord> {
  const profile = buildProfile(req.platform, req.niche, req.riskTier);

  addProfile(profile);

  // Store in vault (async, non-blocking)
  await storeProfileCredentials(profile);
  
  // Register in safety engine (async, non-blocking)
  await registerAccountSafety(profile);
  
  // Log to Brain v2 (async, non-blocking)
  await logProfileToBrain(profile);

  return profile;
}

export function listAllProfiles(): ProfileRecord[] {
  return listProfiles();
}

export function getProfileStatus(id: string) {
  const profile = getProfile(id);
  if (!profile) return null;
  return {
    id: profile.id,
    platform: profile.platform,
    username: profile.username,
    riskTier: profile.riskTier,
    status: profile.status
  };
}
