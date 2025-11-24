// Credential Vault v2 (Iron Vault) - Server

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
    console.log(`\n🔐 Credential Vault v2 (Iron Vault) started on port ${CONFIG.PORT}`);
    console.log(`📦 Service: ${CONFIG.SERVICE_NAME} v${CONFIG.VERSION}`);
    console.log(`🛡️ Mode: ${CONFIG.MODE}`);
    console.log(`🔒 Encryption: ${CONFIG.ENCRYPTION.ALGORITHM.toUpperCase()}`);
    console.log(`🔑 Key Derivation: PBKDF2 (${CONFIG.ENCRYPTION.PBKDF2_ITERATIONS} iterations)`);
    console.log(`📂 Scopes: ${Object.keys(CONFIG.SCOPES).length}`);
    console.log(`👥 Services: ${Object.keys(CONFIG.ACCESS_RULES).length}`);
    console.log(`✅ Health: http://localhost:${CONFIG.PORT}/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
