import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { StrategyQuestion } from "./types.js";
import { buildStrategyPlan, evaluateStrategy, getPlan, getAllPlans } from "./decisionEngine.js";
import { logPlan, logEvaluation } from "./brainLogger.js";

export default async function router(app: FastifyInstance) {
  
  // Health check
  app.get("/health", async (req: FastifyRequest, reply: FastifyReply) => {
    return {
      ok: true,
      service: "codex-strategy",
      version: "1.0.0",
      description: "Strategic Intelligence Layer"
    };
  });

  // Create a new strategy plan
  app.post("/strategy/plan", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const question = req.body as StrategyQuestion;
      
      // Validate input
      if (!question.sessionId || !question.domain || !question.goal || !question.horizonDays) {
        reply.code(400);
        return {
          ok: false,
          error: "Missing required fields: sessionId, domain, goal, horizonDays"
        };
      }
      
      // Build the strategy plan
      const plan = await buildStrategyPlan(question);
      
      // Log to Brain for learning
      await logPlan(plan);
      
      return {
        ok: true,
        plan
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to build strategy plan"
      };
    }
  });

  // Get a specific plan by ID
  app.get("/strategy/plan/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    
    const plan = getPlan(id);
    
    if (!plan) {
      reply.code(404);
      return {
        ok: false,
        error: `Plan not found: ${id}`
      };
    }
    
    return {
      ok: true,
      plan
    };
  });

  // Get all plans
  app.get("/strategy/plans", async (req: FastifyRequest, reply: FastifyReply) => {
    const plans = getAllPlans();
    
    return {
      ok: true,
      count: plans.length,
      plans
    };
  });

  // Evaluate a strategy plan
  app.post("/strategy/evaluate", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { planId } = req.body as { planId: string };
      
      if (!planId) {
        reply.code(400);
        return {
          ok: false,
          error: "Missing required field: planId"
        };
      }
      
      // Evaluate the strategy
      const evaluation = await evaluateStrategy(planId);
      
      // Log to Brain for learning
      await logEvaluation(evaluation);
      
      return {
        ok: true,
        evaluation
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to evaluate strategy"
      };
    }
  });
}
