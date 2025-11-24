import { Platform } from "../types.js";

const PROFILES_URL = "http://localhost:5180";

export async function fetchProfileId(platform: Platform, niche: string) {
  try {
    const response = await fetch(PROFILES_URL + "/profiles/list");
    const res = await response.json() as any;
    const list = res.profiles || [];
    return list.find((p: any) => p.platform === platform);
  } catch (error) {
    console.warn("[ProfilesClient] Failed to fetch profiles:", error);
    return null;
  }
}
