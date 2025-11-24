// Content Routing Engine v2 ULTRA - Server

import Fastify from 'fastify';
import { CONFIG } from './config.js';
import { registerRoutes } from './router.js';

const fastify = Fastify({
  logger: true
});

// Register routes
registerRoutes(fastify);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: CONFIG.PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Content Routing Engine v2 ULTRA started on port ${CONFIG.PORT}`);
    console.log(`📡 Service: ${CONFIG.SERVICE_NAME} v${CONFIG.VERSION}`);
    console.log(`🎯 Endpoints: 12 routing endpoints`);
    console.log(`🤖 LLMs: ${CONFIG.LLM_PROVIDERS.length} providers (GPT-4o, Claude, Gemini, Grok)`);
    console.log(`⚖️ Score Weights: Trend ${CONFIG.SCORE_WEIGHTS.trend}, Visibility ${CONFIG.SCORE_WEIGHTS.visibility}, Risk ${CONFIG.SCORE_WEIGHTS.risk}, Velocity ${CONFIG.SCORE_WEIGHTS.velocity}`);
    console.log(`✅ Health: http://localhost:${CONFIG.PORT}/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
