/**
 * Orchestrator v3.0 - Strategy Router (Hardened)
 * Routes /strategy/* requests to Strategic Intelligence Layer (port 5050)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { callService } from '../hardening/httpClient.js';
import { resolveMode } from '../execution/orchestratorModes.js';

export async function registerStrategyRoutes(app: FastifyInstance) {
  // Forward all /strategy/* requests to Strategy Engine
  app.all('/strategy/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const mode = resolveMode(body?.mode || (request.query as any)?.mode);
      
      const path = request.url;

      const result = await callService(
        'strategy',
        path,
        {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.body)
        },
        { mode }
      );

      return reply.code(result.status).send(result.data);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  console.log('  ✅ Strategy Router registered (/strategy/*) [v3 hardened]');
}
