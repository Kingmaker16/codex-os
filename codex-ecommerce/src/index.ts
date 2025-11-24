/**
 * E-Commerce Engine v2 - Main Entry Point
 * Full-stack e-commerce system with store builder, research, and analytics
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './router.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '5100');
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: false
});

async function start() {
  try {
    // Register CORS
    await app.register(cors, {
      origin: true
    });

    // Register all routes
    await registerRoutes(app);

    // Start server
    await app.listen({ port: PORT, host: HOST });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🛍️  Codex E-Commerce Engine v2.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Port: ${PORT}`);
    console.log('  Features:');
    console.log('    ✅ Next.js Store Builder');
    console.log('    ✅ TikTok Product Research');
    console.log('    ✅ Competitor Analysis');
    console.log('    ✅ AI Content Generation (Copy + Images + UGC)');
    console.log('    ✅ Email & API Fulfillment');
    console.log('    ✅ Analytics + Monetization Sync');
    console.log('  Endpoints:');
    console.log('    POST /builder/createStore');
    console.log('    POST /builder/addProduct');
    console.log('    POST /builder/deploy');
    console.log('    POST /research/findProducts');
    console.log('    POST /research/competitors');
    console.log('    POST /media/productImages');
    console.log('    POST /media/ugcTemplates');
    console.log('    POST /media/productCopy');
    console.log('    POST /fulfillment/test');
    console.log('    POST /analytics/sync');
    console.log('    GET  /analytics/store/:id');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    logger.info(`E-Commerce Engine running on http://${HOST}:${PORT}`);
  } catch (error) {
    logger.error('Failed to start E-Commerce Engine', error);
    process.exit(1);
  }
}

start();
