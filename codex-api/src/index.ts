// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API Gateway v1.0
// Unified Platform Integration (TikTok, YouTube, Instagram, Gmail, AWS, GCP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Fastify from "fastify";
import router from "./router.js";
import { PORT, VERSION } from "./config.js";

const app = Fastify({
  logger: false,
});

// Register router
await app.register(router);

// Health check
app.get("/health", async (request, reply) => {
  reply.send({
    ok: true,
    service: "codex-api",
    version: VERSION,
    features: [
      "tiktok-upload",
      "youtube-upload",
      "instagram-upload",
      "gmail-send",
      "aws-s3-upload",
      "google-cloud-upload",
      "oauth-authentication",
      "credential-vault",
      "token-management",
      "rate-limiting",
    ],
  });
});

// Start server
try {
  await app.listen({ port: Number(PORT), host: "0.0.0.0" });
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 CODEX API GATEWAY v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}

📦 PLATFORM INTEGRATIONS (6):
  ✓ TikTok API v2
  ✓ YouTube Data API v3
  ✓ Instagram Graph API
  ✓ Gmail API
  ✓ AWS S3
  ✓ Google Cloud Storage

🔐 SECURITY FEATURES:
  ✓ AES-256 Credential Vault
  ✓ OAuth 2.0 Token Management
  ✓ Auto Token Refresh
  ✓ Per-Platform Rate Limiting

📡 ENDPOINTS:
  GET  /health
  POST /api/upload
  POST /api/email/send
  POST /api/auth
  POST /api/credentials/store
  GET  /api/credentials
  GET  /api/credentials/:platform/:accountId
  POST /api/platformHealth

🎯 UPLOAD SUPPORT:
  • Video → TikTok, YouTube, Instagram
  • Image → Instagram, AWS S3, GCP
  • Email → Gmail
  • Files → AWS S3, GCP

⚡ RATE LIMITS:
  • TikTok: 100 req/min
  • YouTube: 10k req/day
  • Instagram: 200 req/hour
  • Gmail: 250 req/sec
  • AWS S3: 3500 req/sec
  • GCP: 10k req/min

Ready to serve platform integrations! 🌐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}
