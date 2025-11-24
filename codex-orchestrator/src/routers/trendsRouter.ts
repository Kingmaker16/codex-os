/**
 * Orchestrator v3.0 - Trends Router (Hardened)
 * Routes /trends/* requests to Trend Engine (port 5060)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { callService } from '../hardening/httpClient.js';
import { resolveMode } from '../execution/orchestratorModes.js';

export async function registerTrendsRoutes(app: FastifyInstance) {
  // Forward all /trends/* requests to Trend Engine
  app.all('/trends/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const mode = resolveMode(body?.mode || (request.query as any)?.mode);
      
      const path = (request.url as string).replace('/trends', '');

      const result = await callService(
        'trends',
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

  console.log('  ✅ Trends Router registered (/trends/*) [v3 hardened]');
}
