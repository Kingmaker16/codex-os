// Autonomy Engine v1 - Main Server

import Fastify from 'fastify';
import { registerRoutes } from './router.js';

const PORT = 5420;

const fastify = Fastify({
  logger: true
});

// Register routes
registerRoutes(fastify);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    
    console.log('\n🤖 ═══════════════════════════════════════════════════════════');
    console.log('   AUTONOMY ENGINE v1 (SEMI-AUTONOMOUS MODE) ONLINE');
    console.log('   ═══════════════════════════════════════════════════════════');
    console.log(`   Port: ${PORT}`);
    console.log('   Mode: SEMI-AUTONOMOUS (Safety-Controlled)');
    console.log('   Capabilities:');
    console.log('     • Self-directed decision-making');
    console.log('     • Task decomposition & dependency mapping');
    console.log('     • Safe delegation to 6 authorized services');
    console.log('     • Workflow continuation with guardrails');
    console.log('     • Memory-informed reasoning');
    console.log('     • Real-time safety scoring & gating');
    console.log('   ═══════════════════════════════════════════════════════════');
    console.log('   Safety Thresholds:');
    console.log('     • Risk < 30: AUTO-ALLOW');
    console.log('     • Risk 30-60: ALLOW WITH CAUTION');
    console.log('     • Risk > 60: REQUIRE USER APPROVAL');
    console.log('   ═══════════════════════════════════════════════════════════');
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log('   ═══════════════════════════════════════════════════════════\n');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
