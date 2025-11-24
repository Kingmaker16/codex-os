// Content Routing Engine v2 ULTRA - API Router

import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import type { RoutingRequest, Content, Platform, OptimizationOptions, RouteStatus } from './types.js';
import { CONFIG } from './config.js';
import { stateManager } from './state/stateManager.js';
import { optimizeRoutes, reweightScores } from './core/routeOptimizer.js';
import { simulateRoute, simulateMultipleRoutes, compareSimulations } from './core/routeSimulator.js';
import { getLLMRoutingSuggestions } from './core/routingLLMEngine.js';
import { logRoutingEvent } from './integrations/brainIntegration.js';
import { logMetric, logOperation } from './integrations/opsIntegration.js';

export function registerRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return {
      ok: true,
      service: CONFIG.SERVICE_NAME,
      version: CONFIG.VERSION,
      port: CONFIG.PORT
    };
  });

  // Analyze route - Full routing analysis with LLM + scoring
  fastify.post<{ Body: RoutingRequest }>('/routing/analyze', async (request, reply) => {
    const { contentId, content, targetPlatforms, languages, maxRisk, trendWeighted } = request.body;

    const routeId = uuidv4();
    const platforms: Platform[] = targetPlatforms || ['tiktok', 'youtube', 'instagram', 'twitter', 'linkedin'];

    // Step 1: Get LLM consensus
    const llmConsensus = await getLLMRoutingSuggestions(content);

    // Step 2: Score all platforms
    const routes = await optimizeRoutes(content, platforms, {
      minScore: 0.5,
      diversifyPlatforms: true,
      trendBoost: trendWeighted ? 1.3 : 1.0
    });

    // Step 3: Save state
    stateManager.createRoute({
      routeId,
      contentId,
      routes,
      status: 'ANALYZED' as RouteStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Log to Brain v2 and Ops
    await logRoutingEvent('routing', { routeId, contentId, action: 'analyze', routes: routes.length });
    await logMetric('routes_analyzed', routes.length, { contentId });

    return {
      routeId,
      contentId,
      routes,
      topRoute: routes[0],
      alternatives: routes.slice(1, 4),
      llmConsensus,
      timestamp: new Date().toISOString(),
      status: 'ANALYZED'
    };
  });

  // Get route scores
  fastify.post<{ Body: { content: Content; platforms: Platform[] } }>('/routing/scores', async (request, reply) => {
    const { content, platforms } = request.body;

    const routes = await optimizeRoutes(content, platforms, { maxRoutes: 10 });

    return {
      contentId: content.id,
      scores: routes.map(r => ({
        platform: r.platform,
        totalScore: r.score,
        breakdown: {
          trend: r.trendScore,
          visibility: r.visibilityScore,
          risk: r.riskScore,
          velocity: r.velocityScore
        },
        confidence: r.confidence,
        reasoning: r.reasoning
      }))
    };
  });

  // Optimize routes with custom weights
  fastify.post<{ Body: { routeId: string; weights?: any } }>('/routing/optimize', async (request, reply) => {
    const { routeId, weights } = request.body;

    const routeState = stateManager.getRoute(routeId);
    if (!routeState) {
      return reply.status(404).send({ error: 'Route not found' });
    }

    const optimized = weights
      ? reweightScores(routeState.routes, weights)
      : routeState.routes;

    stateManager.updateRoute(routeId, { routes: optimized, status: 'OPTIMIZED' as RouteStatus });

    await logOperation('route_optimize', 'success', { routeId });

    return {
      routeId,
      routes: optimized,
      topRoute: optimized[0],
      status: 'OPTIMIZED'
    };
  });

  // Simulate route
  fastify.post<{ Body: { routeId: string; routeIndex?: number } }>('/routing/simulate', async (request, reply) => {
    const { routeId, routeIndex } = request.body;

    const routeState = stateManager.getRoute(routeId);
    if (!routeState) {
      return reply.status(404).send({ error: 'Route not found' });
    }

    const targetRoute = routeState.routes[routeIndex || 0];
    if (!targetRoute) {
      return reply.status(400).send({ error: 'Invalid route index' });
    }

    const simulation = await simulateRoute(targetRoute, routeState.contentId);

    await logOperation('route_simulate', 'success', { routeId, platform: targetRoute.platform });

    return simulation;
  });

  // Simulate all routes
  fastify.post<{ Body: { routeId: string } }>('/routing/simulate-all', async (request, reply) => {
    const { routeId } = request.body;

    const routeState = stateManager.getRoute(routeId);
    if (!routeState) {
      return reply.status(404).send({ error: 'Route not found' });
    }

    const simulations = await simulateMultipleRoutes(routeState.routes, routeState.contentId);
    const bestSimulation = compareSimulations(simulations);

    await logOperation('route_simulate_all', 'success', { routeId, count: simulations.length });

    return {
      routeId,
      simulations,
      bestRoute: bestSimulation,
      comparison: simulations.map(s => ({
        platform: s.route.platform,
        successProbability: s.successProbability,
        predictedReach: s.predictedReach,
        estimatedRevenue: s.estimatedRevenue
      }))
    };
  });

  // Get LLM consensus only
  fastify.post<{ Body: { content: Content } }>('/routing/llm-consensus', async (request, reply) => {
    const { content } = request.body;

    const consensus = await getLLMRoutingSuggestions(content);

    await logOperation('llm_consensus', 'success', { contentId: content.id });

    return {
      contentId: content.id,
      consensus,
      timestamp: new Date().toISOString()
    };
  });

  // Get route status
  fastify.get<{ Params: { routeId: string } }>('/routing/status/:routeId', async (request, reply) => {
    const { routeId } = request.params;

    const routeState = stateManager.getRoute(routeId);
    if (!routeState) {
      return reply.status(404).send({ error: 'Route not found' });
    }

    return {
      routeId,
      contentId: routeState.contentId,
      status: routeState.status,
      routeCount: routeState.routes.length,
      topPlatform: routeState.routes[0]?.platform,
      createdAt: routeState.createdAt,
      updatedAt: routeState.updatedAt
    };
  });

  // Get all routes
  fastify.get('/routing/routes', async (request, reply) => {
    const routes = stateManager.getAllRoutes();

    return {
      count: routes.length,
      routes: routes.map(r => ({
        routeId: r.routeId,
        contentId: r.contentId,
        status: r.status,
        topPlatform: r.routes[0]?.platform,
        topScore: r.routes[0]?.score,
        createdAt: r.createdAt
      }))
    };
  });

  // Compare platforms
  fastify.post<{ Body: { content: Content; platforms: Platform[] } }>('/routing/compare', async (request, reply) => {
    const { content, platforms } = request.body;

    const routes = await optimizeRoutes(content, platforms, { maxRoutes: platforms.length });

    return {
      contentId: content.id,
      comparison: routes.map((r, index) => ({
        rank: index + 1,
        platform: r.platform,
        score: r.score,
        strengths: identifyStrengths(r),
        weaknesses: identifyWeaknesses(r)
      }))
    };
  });

  // Recommend best platform
  fastify.post<{ Body: { content: Content } }>('/routing/recommend', async (request, reply) => {
    const { content } = request.body;

    const platforms: Platform[] = ['tiktok', 'youtube', 'instagram', 'twitter', 'linkedin'];
    const routes = await optimizeRoutes(content, platforms, { maxRoutes: 1 });

    if (routes.length === 0) {
      return reply.status(400).send({ error: 'No suitable routes found' });
    }

    const topRoute = routes[0];

    await logOperation('route_recommend', 'success', { contentId: content.id, platform: topRoute.platform });

    return {
      contentId: content.id,
      recommended: {
        platform: topRoute.platform,
        score: topRoute.score,
        confidence: topRoute.confidence,
        reasoning: topRoute.reasoning
      },
      simulation: await simulateRoute(topRoute, content.id)
    };
  });

  // Quick route (fast recommendation without full analysis)
  fastify.post<{ Body: { content: Content } }>('/routing/quick', async (request, reply) => {
    const { content } = request.body;

    // Skip LLM consensus, use only scoring
    const platforms: Platform[] = ['tiktok', 'youtube', 'instagram'];
    const routes = await optimizeRoutes(content, platforms, { maxRoutes: 1, minScore: 0.4 });

    if (routes.length === 0) {
      return { platform: 'tiktok', score: 0.5, reasoning: 'Default fallback' };
    }

    return {
      platform: routes[0].platform,
      score: routes[0].score,
      reasoning: routes[0].reasoning
    };
  });

  // Batch routing
  fastify.post<{ Body: { contents: Content[] } }>('/routing/batch', async (request, reply) => {
    const { contents } = request.body;

    const results = await Promise.all(
      contents.map(async (content) => {
        const platforms: Platform[] = ['tiktok', 'youtube', 'instagram', 'twitter', 'linkedin'];
        const routes = await optimizeRoutes(content, platforms, { maxRoutes: 3 });

        return {
          contentId: content.id,
          topRoute: routes[0],
          alternatives: routes.slice(1, 3)
        };
      })
    );

    await logMetric('batch_routed', contents.length);

    return {
      count: contents.length,
      results
    };
  });
}

function identifyStrengths(route: any): string[] {
  const strengths: string[] = [];
  if (route.trendScore > 0.7) strengths.push('Strong trend alignment');
  if (route.visibilityScore > 0.7) strengths.push('High visibility potential');
  if (route.riskScore > 0.8) strengths.push('Very safe');
  if (route.velocityScore > 0.7) strengths.push('Optimal posting velocity');
  return strengths;
}

function identifyWeaknesses(route: any): string[] {
  const weaknesses: string[] = [];
  if (route.trendScore < 0.4) weaknesses.push('Low trend match');
  if (route.visibilityScore < 0.4) weaknesses.push('Limited visibility');
  if (route.riskScore < 0.5) weaknesses.push('Elevated risk');
  if (route.velocityScore < 0.4) weaknesses.push('Platform saturated');
  return weaknesses;
}
