/**
 * Orchestrator v2.0 - E-Commerce Router
 * Routes /ecomm/* requests to E-Commerce Engine (port 5100)
 */

import axios from 'axios';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const ECOMMERCE_URL = process.env.ECOMMERCE_URL || 'http://localhost:5100';

export async function registerEcommerceRoutes(app: FastifyInstance) {
  // Forward all /ecomm/* requests to E-Commerce Engine
  app.all('/ecomm/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const path = (request.url as string).replace('/ecomm', '');
      const targetUrl = `${ECOMMERCE_URL}${path}`;

      const response = await axios({
        method: request.method as any,
        url: targetUrl,
        data: request.body,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return reply.code(error.response.status).send(error.response.data);
      }
      return reply.code(500).send({ error: error.message });
    }
  });

  // E-Commerce specific intent routes
  app.post('/task/ecomm/build-store', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await axios.post(`${ECOMMERCE_URL}/builder/createStore`, request.body);
      return response.data;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/task/ecomm/research', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await axios.post(`${ECOMMERCE_URL}/research/findProducts`, request.body);
      return response.data;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/task/ecomm/generate-content', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { type, ...rest } = request.body as any;
      
      let endpoint = '/media/productCopy';
      if (type === 'images') endpoint = '/media/productImages';
      if (type === 'ugc') endpoint = '/media/ugcTemplates';
      
      const response = await axios.post(`${ECOMMERCE_URL}${endpoint}`, rest);
      return response.data;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  console.log('  ✅ E-Commerce Router registered (/ecomm/*)');
}
