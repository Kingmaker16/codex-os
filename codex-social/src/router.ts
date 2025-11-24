/**
 * Social Engine v1 - API Router
 */

import type { FastifyInstance } from "fastify";
import type { CreateAccountRequest, LoginRequest, PostRequest, UploadRequest } from "./types.js";
import {
  createAccount,
  getAllAccounts,
  getAccount,
  getAccountsByPlatform
} from "./accountManager.js";
import { loginToAccount, checkLoginStatus } from "./authEngine.js";
import { scrapeDashboard } from "./dashboardScraper.js";
import { getAnalytics, getGrowthInsights } from "./analyticsEngine.js";
import { schedulePost, getScheduledPosts, getPendingPosts } from "./scheduler.js";
import { CONFIG } from "./config.js";

// v1.5 imports
import { uploadVideoToPlatforms } from "./uploadPipeline.js";
import { generateCaption } from "./captionGenerator.js";
import { suggestHashtags } from "./hashtagEngine.js";
import { planPostsForAccount } from "./contentPlanner.js";
import { scanTrends } from "./trendScanner.js";
import { syncMetrics } from "./metricsSync.js";
import { logToBrain } from "./brainLogger.js";

export function registerRoutes(app: FastifyInstance): void {
  
  // Health check
  app.get("/health", async () => ({
    status: "ok",
    service: "codex-social",
    version: "1.5.0",
    mode: "multi-account",
    features: ["upload", "captions", "planning", "trends", "metrics"]
  }));

  // Create new social account
  app.post<{ Body: CreateAccountRequest }>("/social/createAccount", async (request, reply) => {
    try {
      const account = createAccount(request.body);
      return { success: true, account };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Login to account
  app.post<{ Body: LoginRequest }>("/social/login", async (request, reply) => {
    try {
      const { accountId, useCaptchaSolver = true } = request.body;
      
      const account = getAccount(accountId);
      if (!account) {
        reply.code(404);
        return { success: false, error: "Account not found" };
      }

      const result = await loginToAccount(account, useCaptchaSolver);
      
      if (result.success) {
        return { 
          success: true, 
          message: `Logged in to ${account.platform}`,
          account 
        };
      } else {
        reply.code(500);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Post content immediately
  app.post<{ Body: PostRequest }>("/social/post", async (request, reply) => {
    try {
      const { accountId, platform, content } = request.body;

      const account = getAccount(accountId);
      if (!account) {
        reply.code(404);
        return { success: false, error: "Account not found" };
      }

      // Check login status first
      const isLoggedIn = await checkLoginStatus(account);
      if (!isLoggedIn) {
        return { 
          success: false, 
          error: "Not logged in",
          suggestion: "Call /social/login first"
        };
      }

      // Import platform-specific handler
      const platformModule = await import(`./platforms/${platform}.js`);
      const success = await platformModule.postContent(accountId, content);

      if (success) {
        return { 
          success: true, 
          message: `Posted to ${platform}`,
          accountId 
        };
      } else {
        reply.code(500);
        return { success: false, error: "Post failed" };
      }

    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Schedule post for later
  app.post<{ Body: PostRequest }>("/social/schedule", async (request, reply) => {
    try {
      if (!request.body.scheduledFor) {
        reply.code(400);
        return { success: false, error: "scheduledFor is required" };
      }

      const post = schedulePost(request.body);
      
      return { 
        success: true, 
        message: "Post scheduled",
        post 
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get analytics for account
  app.get<{ Querystring: { accountId: string } }>("/social/analytics", async (request, reply) => {
    try {
      const { accountId } = request.query;
      
      if (!accountId) {
        reply.code(400);
        return { success: false, error: "accountId is required" };
      }

      const account = getAccount(accountId);
      if (!account) {
        reply.code(404);
        return { success: false, error: "Account not found" };
      }

      const analytics = await getAnalytics(account);
      const insights = await getGrowthInsights(account);

      return { 
        success: true, 
        analytics,
        insights
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Open dashboard in browser
  app.post<{ Body: { accountId: string } }>("/social/openDashboard", async (request, reply) => {
    try {
      const { accountId } = request.body;
      
      const account = getAccount(accountId);
      if (!account) {
        reply.code(404);
        return { success: false, error: "Account not found" };
      }

      const dashboardData = await scrapeDashboard(account);

      return { 
        success: true, 
        message: "Dashboard opened",
        data: dashboardData
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get all accounts
  app.get("/social/accounts", async (request, reply) => {
    try {
      const platform = (request.query as any).platform;
      
      const accounts = platform 
        ? getAccountsByPlatform(platform)
        : getAllAccounts();

      return { 
        success: true, 
        count: accounts.length,
        accounts 
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // ──────────────────────────────────────────────────────────────
  // Social Engine v1.5 - New Endpoints
  // ──────────────────────────────────────────────────────────────

  // Upload video to multiple platforms
  app.post<{ Body: UploadRequest }>("/social/upload", async (request, reply) => {
    try {
      const payload = request.body;

      // Validate required fields
      if (!payload.accountId || !payload.videoPath || !payload.platforms || payload.platforms.length === 0) {
        reply.code(400);
        return { success: false, error: "Missing required fields: accountId, videoPath, platforms" };
      }

      // Upload to platforms
      const results = await uploadVideoToPlatforms(payload);

      // Log to Brain
      await logToBrain(
        "codex-social-uploads",
        `Upload completed for account ${payload.accountId}: ${results.filter(r => r.ok).length}/${results.length} successful`
      );

      return {
        success: true,
        results
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Generate caption for video
  app.post("/social/generateCaption", async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body.platform || !body.niche) {
        reply.code(400);
        return { success: false, error: "Missing required fields: platform, niche" };
      }

      const result = await generateCaption({
        platform: body.platform,
        niche: body.niche,
        script: body.script,
        brandTone: body.brandTone
      });

      return {
        success: true,
        ...result
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Plan content for account
  app.post("/social/plan", async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body.accountId || !body.days || !body.perDay) {
        reply.code(400);
        return { success: false, error: "Missing required fields: accountId, days, perDay" };
      }

      const plannedPosts = await planPostsForAccount(body.accountId, {
        days: body.days,
        perDay: body.perDay
      });

      // Save to schedule file
      // This will be handled by scheduler integration

      // Log to Brain
      await logToBrain(
        "codex-social-plans",
        `Created content plan for account ${body.accountId}: ${plannedPosts.length} posts`
      );

      return {
        success: true,
        planned: plannedPosts
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get trends for platform/niche
  app.get("/social/trends", async (request, reply) => {
    try {
      const query = request.query as any;

      if (!query.platform || !query.niche) {
        reply.code(400);
        return { success: false, error: "Missing required query params: platform, niche" };
      }

      const insights = await scanTrends(query.platform, query.niche);

      return {
        success: true,
        platform: query.platform,
        niche: query.niche,
        insights
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Sync metrics to Monetization Engine
  app.post("/social/metrics/sync", async (request, reply) => {
    try {
      await syncMetrics();

      return {
        success: true,
        message: "Metrics synced to Monetization Engine"
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get scheduled posts
  app.get("/social/scheduled", async (request, reply) => {
    try {
      const status = (request.query as any).status;
      
      const posts = status === "pending" 
        ? getPendingPosts()
        : getScheduledPosts();

      return { 
        success: true, 
        count: posts.length,
        posts 
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}
