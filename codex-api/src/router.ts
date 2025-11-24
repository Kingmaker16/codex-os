// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { uploadToTikTok } from "./services/tiktokApi.js";
import { uploadToYouTube } from "./services/youtubeApi.js";
import { uploadToInstagram } from "./services/instagramApi.js";
import { uploadToS3 } from "./services/awsS3.js";
import { uploadToGoogleCloud } from "./services/googleCloud.js";
import { sendGmailEmail } from "./services/gmailApi.js";
import { storeCredential, getCredential, listCredentials } from "./services/credentialVault.js";
import { getTokenInfo } from "./services/tokenManager.js";
import { getRateLimitStatus } from "./services/rateLimitGuard.js";
import { OAUTH_CLIENTS, OAUTH_REDIRECT_BASE } from "./config.js";
import type {
  UploadRequest,
  UploadResponse,
  AuthRequest,
  AuthResponse,
  Platform,
  Credential,
  PlatformHealth,
} from "./types.js";

export default async function router(app: FastifyInstance) {
  /**
   * POST /api/upload - Unified upload endpoint
   */
  app.post("/api/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    const uploadRequest = request.body as UploadRequest;
    
    if (!uploadRequest.sessionId || !uploadRequest.platform) {
      return reply.status(400).send({
        ok: false,
        error: "Missing required fields: sessionId, platform",
      });
    }
    
    let response: UploadResponse;
    
    switch (uploadRequest.platform) {
      case "tiktok":
        response = await uploadToTikTok(uploadRequest);
        break;
      case "youtube":
        response = await uploadToYouTube(uploadRequest);
        break;
      case "instagram":
        response = await uploadToInstagram(uploadRequest);
        break;
      case "aws_s3":
        response = await uploadToS3(uploadRequest);
        break;
      case "google_cloud":
        response = await uploadToGoogleCloud(uploadRequest);
        break;
      case "gmail":
        // Gmail is for email, not upload
        response = {
          ok: false,
          sessionId: uploadRequest.sessionId,
          platform: "gmail",
          status: "failed",
          error: "Gmail does not support upload. Use /api/email/send instead.",
        };
        break;
      default:
        response = {
          ok: false,
          sessionId: uploadRequest.sessionId,
          platform: uploadRequest.platform,
          status: "failed",
          error: "Unsupported platform",
        };
    }
    
    reply.send(response);
  });
  
  /**
   * POST /api/email/send - Send email via Gmail
   */
  app.post("/api/email/send", async (request: FastifyRequest, reply: FastifyReply) => {
    const { accountId, to, subject, body } = request.body as any;
    
    if (!accountId || !to || !subject || !body) {
      return reply.status(400).send({
        ok: false,
        error: "Missing required fields: accountId, to, subject, body",
      });
    }
    
    const result = await sendGmailEmail(accountId, to, subject, body);
    reply.send(result);
  });
  
  /**
   * POST /api/auth - OAuth authentication flow
   */
  app.post("/api/auth", async (request: FastifyRequest, reply: FastifyReply) => {
    const authRequest = request.body as AuthRequest;
    
    if (!authRequest.sessionId || !authRequest.platform) {
      return reply.status(400).send({
        ok: false,
        error: "Missing required fields: sessionId, platform",
      });
    }
    
    const { sessionId, platform, accountId, code } = authRequest;
    
    // If code is provided, exchange for tokens
    if (code) {
      // In production, implement actual OAuth token exchange
      const response: AuthResponse = {
        ok: true,
        sessionId,
        platform,
        status: "authenticated",
        message: "Authentication successful",
      };
      
      return reply.send(response);
    }
    
    // Generate OAuth URL
    let authUrl = "";
    const redirectUri = `${OAUTH_REDIRECT_BASE}?platform=${platform}&sessionId=${sessionId}`;
    
    switch (platform) {
      case "youtube":
      case "gmail": {
        const config = OAUTH_CLIENTS.youtube;
        const scope =
          platform === "youtube"
            ? "https://www.googleapis.com/auth/youtube.upload"
            : "https://www.googleapis.com/auth/gmail.send";
        
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
        break;
      }
      case "tiktok": {
        const config = OAUTH_CLIENTS.tiktok;
        authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user.info.basic,video.upload`;
        break;
      }
      case "instagram": {
        const config = OAUTH_CLIENTS.instagram;
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.clientId}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish`;
        break;
      }
      default:
        return reply.status(400).send({
          ok: false,
          sessionId,
          platform,
          status: "failed",
          error: "Unsupported platform for OAuth",
        });
    }
    
    const response: AuthResponse = {
      ok: true,
      sessionId,
      platform,
      authUrl,
      status: "pending",
      message: "Navigate to authUrl to complete authentication",
    };
    
    reply.send(response);
  });
  
  /**
   * POST /api/credentials/store - Store credentials
   */
  app.post("/api/credentials/store", async (request: FastifyRequest, reply: FastifyReply) => {
    const { platform, accountId, credential } = request.body as {
      platform: Platform;
      accountId: string;
      credential: Credential;
    };
    
    if (!platform || !accountId || !credential) {
      return reply.status(400).send({
        ok: false,
        error: "Missing required fields: platform, accountId, credential",
      });
    }
    
    await storeCredential(platform, accountId, credential);
    
    reply.send({
      ok: true,
      message: "Credential stored successfully",
    });
  });
  
  /**
   * GET /api/credentials/:platform/:accountId - Get credential
   */
  app.get("/api/credentials/:platform/:accountId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { platform, accountId } = request.params as {
      platform: Platform;
      accountId: string;
    };
    
    const credential = await getCredential(platform, accountId);
    
    if (!credential) {
      return reply.status(404).send({
        ok: false,
        error: "Credential not found",
      });
    }
    
    // Return credential without sensitive data
    reply.send({
      ok: true,
      credential: {
        platform: credential.platform,
        accountId: credential.accountId,
        expiresAt: credential.expiresAt,
        hasAccessToken: !!credential.accessToken,
        hasRefreshToken: !!credential.refreshToken,
      },
    });
  });
  
  /**
   * GET /api/credentials - List all credentials
   */
  app.get("/api/credentials", async (request: FastifyRequest, reply: FastifyReply) => {
    const credentials = await listCredentials();
    
    reply.send({
      ok: true,
      credentials,
    });
  });
  
  /**
   * POST /api/platformHealth - Check platform health
   */
  app.post("/api/platformHealth", async (request: FastifyRequest, reply: FastifyReply) => {
    const { platforms } = request.body as { platforms?: Platform[] };
    
    const allPlatforms: Platform[] = platforms || [
      "tiktok",
      "youtube",
      "instagram",
      "gmail",
      "aws_s3",
      "google_cloud",
    ];
    
    const healthData: PlatformHealth[] = [];
    
    for (const platform of allPlatforms) {
      const rateLimit = getRateLimitStatus(platform);
      
      healthData.push({
        platform,
        status: "healthy", // In production, check actual API health
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
        lastCheck: Date.now(),
      });
    }
    
    reply.send({
      ok: true,
      platforms: healthData,
    });
  });
}
