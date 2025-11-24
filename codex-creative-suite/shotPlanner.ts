// =============================================
// CREATIVE SUITE v1.5 — SHOT PLANNER
// =============================================

export interface ShotPlan {
  shotId: string;
  timestamp: number;
  duration: number;
  aspectRatio: "1:1" | "9:16" | "16:9";
  composition: string;
  camera: string;
  lighting: string;
  viralAlignment: number; // 0-100
}

export function generateShotPlan(
  platform: "tiktok" | "youtube" | "instagram",
  contentType: "short-form" | "long-form" | "ugc-ad"
): ShotPlan[] {
  console.log(`[ShotPlanner] Generating shot plan for ${platform} ${contentType}`);

  const aspectRatio = platform === "tiktok" || platform === "instagram" ? "9:16" : "16:9";
  const duration = contentType === "short-form" ? 30 : 180;

  const shots: ShotPlan[] = [
    {
      shotId: "shot-1",
      timestamp: 0,
      duration: 3,
      aspectRatio,
      composition: "Close-up on face with product in frame",
      camera: "Eye level, slight dutch angle for energy",
      lighting: "Natural bright, high contrast",
      viralAlignment: 95
    },
    {
      shotId: "shot-2",
      timestamp: 3,
      duration: 7,
      aspectRatio,
      composition: "Medium shot, product demonstration",
      camera: "Handheld, dynamic movement",
      lighting: "Soft key light, minimal shadows",
      viralAlignment: 88
    },
    {
      shotId: "shot-3",
      timestamp: 10,
      duration: 10,
      aspectRatio,
      composition: "Wide shot, lifestyle context",
      camera: "Locked off, stable",
      lighting: "Natural or studio fill",
      viralAlignment: 75
    }
  ];

  return shots;
}

export function alignPacingWithViral(shots: ShotPlan[]): ShotPlan[] {
  // Adjust shot durations for viral pacing (fast cuts for TikTok/Shorts)
  return shots.map(shot => {
    if (shot.duration > 5) {
      shot.duration = Math.max(3, shot.duration * 0.7);
      shot.viralAlignment += 10;
    }
    return shot;
  });
}

export function optimizeForPlatform(
  shots: ShotPlan[],
  platform: "tiktok" | "youtube" | "instagram"
): ShotPlan[] {
  console.log(`[ShotPlanner] Optimizing for ${platform}`);
  
  const platformRules: Record<string, any> = {
    tiktok: { maxShotDuration: 5, preferredPacing: "fast", aspectRatio: "9:16" },
    youtube: { maxShotDuration: 8, preferredPacing: "medium", aspectRatio: "16:9" },
    instagram: { maxShotDuration: 6, preferredPacing: "fast", aspectRatio: "9:16" }
  };

  const rules = platformRules[platform];
  
  return shots.map(shot => ({
    ...shot,
    duration: Math.min(shot.duration, rules.maxShotDuration),
    aspectRatio: rules.aspectRatio
  }));
}
