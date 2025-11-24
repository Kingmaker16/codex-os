import { FastifyInstance } from "fastify";
import { RLRunRequest, RLReplayRequest, RLPolicyRequest } from "./types.js";
import { runRLCycle, replayEpisodes, generatePolicyProposal } from "./rlOrchestrator.js";
import { globalBuffer } from "./experienceBuffer.js";
import { applyPolicy } from "./policyEngine.js";
import { logPolicyToBrain } from "./brainLogger.js";

let pendingPolicy: any = null;

export async function rlRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-rl",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS",
    rlType: "A2C-lite",
    bufferStats: globalBuffer.getBufferStats()
  }));

  app.post("/rl/run", async (req, reply) => {
    try {
      const body = req.body as RLRunRequest;
      const episode = await runRLCycle(body);
      return {
        ok: true,
        episode: {
          id: episode.id,
          sessionId: episode.sessionId,
          totalReward: episode.totalReward,
          episodeLength: episode.episodeLength,
          avgReward: episode.totalReward / episode.episodeLength,
          timestamp: episode.timestamp
        },
        bufferStats: globalBuffer.getBufferStats()
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/rl/replay", async (req, reply) => {
    try {
      const body = req.body as RLReplayRequest;
      const episodes = replayEpisodes(body.sessionId, body.limit);
      return {
        ok: true,
        episodes: episodes.map(ep => ({
          id: ep.id,
          sessionId: ep.sessionId,
          totalReward: ep.totalReward,
          episodeLength: ep.episodeLength,
          timestamp: ep.timestamp
        })),
        count: episodes.length
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/rl/policy", async (req, reply) => {
    try {
      const body = req.body as RLPolicyRequest;
      
      // If approving an existing policy
      if (body.approve && pendingPolicy) {
        const result = applyPolicy(pendingPolicy.policy, true);
        await logPolicyToBrain(pendingPolicy.policy, "rl-policy-approval");
        
        const approved = { ...pendingPolicy.policy, approved: true };
        pendingPolicy = null;
        
        return {
          ok: true,
          result,
          policy: approved
        };
      }
      
      // Generate new policy proposal
      const proposalResult = generatePolicyProposal();
      
      if (!proposalResult.ok) {
        reply.status(400);
        return proposalResult;
      }
      
      pendingPolicy = proposalResult;
      await logPolicyToBrain(proposalResult.policy, "rl-policy-proposal");
      
      return {
        ok: true,
        policy: proposalResult.policy,
        message: "Policy proposal generated. Set approve=true to apply.",
        requiresApproval: true
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/rl/buffer", async () => ({
    ok: true,
    stats: globalBuffer.getBufferStats()
  }));
}
