// Codex Orchestrator - Autonomy Router
// Proxies autonomy engine requests to port 5420

import type { FastifyInstance } from 'fastify';

const AUTONOMY_PORT = 5420;
const AUTONOMY_URL = `http://localhost:${AUTONOMY_PORT}`;

export function registerAutonomyRoutes(fastify: FastifyInstance) {
  /**
   * Evaluate a decision
   */
  fastify.post('/autonomy/evaluate', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Decompose a task
   */
  fastify.post('/autonomy/decompose', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Delegate a task
   */
  fastify.post('/autonomy/delegate', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Create action plan
   */
  fastify.post('/autonomy/plan', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Continue execution
   */
  fastify.post('/autonomy/continue', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/continue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body)
      });

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Get plan status
   */
  fastify.get('/autonomy/plan/:planId', async (request, reply) => {
    try {
      const { planId } = request.params as { planId: string };
      const response = await fetch(`${AUTONOMY_URL}/autonomy/plan/${planId}`);

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Get all plans
   */
  fastify.get('/autonomy/plans', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/plans`);

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });

  /**
   * Get available services
   */
  fastify.get('/autonomy/services', async (request, reply) => {
    try {
      const response = await fetch(`${AUTONOMY_URL}/autonomy/services`);

      const data = await response.json();
      return reply.send(data);
    } catch (error: any) {
      return reply.status(503).send({
        error: 'Autonomy Engine unavailable',
        message: error.message
      });
    }
  });
}
