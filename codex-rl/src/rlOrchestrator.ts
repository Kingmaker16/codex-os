import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { RLState, RLAction, RLExperience, RLEpisode, RLRunRequest } from "./types.js";
import { computeReward, normalizeReward } from "./rewardEngine.js";
import { updateAdvantages } from "./valueEngine.js";
import { proposePolicy } from "./policyEngine.js";
import { globalBuffer } from "./experienceBuffer.js";
import { logEpisodeToBrain } from "./brainLogger.js";

async function fetchCurrentState(): Promise<RLState> {
  // Fetch metrics from various services
  let trendScore = 0;
  let visibilityScore = 0;
  let engagementRate = 0;
  let revenue = 0;

  try {
    const trendsResp = await fetch("http://localhost:4350/trends/current");
    const trendsData = await trendsResp.json() as any;
    trendScore = trendsData.score ?? 0;
  } catch {}

  try {
    const visResp = await fetch("http://localhost:5030/visibility/stats");
    const visData = await visResp.json() as any;
    visibilityScore = visData.totalViews ?? 0;
  } catch {}

  try {
    const engResp = await fetch("http://localhost:5040/engagement/stats");
    const engData = await engResp.json() as any;
    engagementRate = engData.avgEngagementRate ?? 0;
  } catch {}

  try {
    const ecommResp = await fetch("http://localhost:5100/shop/stats");
    const ecommData = await ecommResp.json() as any;
    revenue = ecommData.totalRevenue ?? 0;
  } catch {}

  return {
    trendScore,
    visibilityScore,
    engagementRate,
    revenue,
    timestamp: new Date().toISOString()
  };
}

function sampleAction(): RLAction {
  const actionTypes = ["strategy", "distribution", "campaign", "ecommerce"];
  const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)] as any;

  return {
    type: randomType,
    description: `Simulated ${randomType} action`,
    parameters: { simulated: true }
  };
}

export async function runRLCycle(req: RLRunRequest): Promise<RLEpisode> {
  const episodeId = uuidv4();
  const episodeExperiences: RLExperience[] = [];
  
  // Initial state
  let currentState = await fetchCurrentState();
  
  const numSteps = req.episodes ?? 5;
  
  for (let step = 0; step < numSteps; step++) {
    // Sample action
    const action = sampleAction();
    
    // Simulate environment step (in production, actually execute action)
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    
    // Observe next state
    const nextState = await fetchCurrentState();
    
    // Compute reward
    const rewardBreakdown = computeReward(nextState, currentState);
    const reward = normalizeReward(rewardBreakdown.totalReward);
    
    // Create experience
    const experience: RLExperience = {
      id: uuidv4(),
      state: currentState,
      action,
      reward,
      rewardBreakdown,
      nextState,
      advantage: 0, // Will be computed later
      timestamp: new Date().toISOString()
    };
    
    episodeExperiences.push(experience);
    globalBuffer.addExperience(experience);
    
    currentState = nextState;
  }
  
  // Compute advantages
  const updatedExperiences = updateAdvantages(episodeExperiences);
  
  // Create episode
  const totalReward = updatedExperiences.reduce((sum, exp) => sum + exp.reward, 0);
  const episode: RLEpisode = {
    id: episodeId,
    sessionId: req.sessionId,
    experiences: updatedExperiences,
    totalReward,
    episodeLength: updatedExperiences.length,
    timestamp: new Date().toISOString()
  };
  
  globalBuffer.addEpisode(episode);
  await logEpisodeToBrain(episode);
  
  return episode;
}

export function replayEpisodes(sessionId?: string, limit?: number): RLEpisode[] {
  if (sessionId) {
    const episodes = globalBuffer.getEpisodesBySession(sessionId);
    return limit ? episodes.slice(-limit) : episodes;
  }
  return globalBuffer.getEpisodes(limit);
}

export function generatePolicyProposal(): any {
  const experiences = globalBuffer.getExperiences(100);
  if (experiences.length < 10) {
    return {
      ok: false,
      message: "Insufficient experiences for policy proposal (need at least 10)"
    };
  }
  
  const policy = proposePolicy(experiences);
  return {
    ok: true,
    policy,
    message: "Policy proposal generated. Requires approval before application."
  };
}
