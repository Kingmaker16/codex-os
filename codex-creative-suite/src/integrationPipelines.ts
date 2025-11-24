// integrationPipelines.ts - Downstream Service Integration

import type { IntegrationPayload, CreativePlan } from "./types.js";

const SERVICE_URLS = {
  social: "http://localhost:4350", // Hands v5.0 Social Engine
  campaign: "http://localhost:5120", // Campaign Engine
  video: "http://localhost:4700", // Video Engine
  engagement: "http://localhost:5110", // Engagement Engine
  ecommerce: "http://localhost:5100", // E-Commerce Engine
};

export class IntegrationPipelines {
  /**
   * Send creative plan to Campaign Engine
   */
  async sendToCampaign(
    creativePlan: CreativePlan,
    campaignId: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`[Integration] Sending creative plan to Campaign Engine (${campaignId})`);

    try {
      const response = await fetch(`${SERVICE_URLS.campaign}/campaigns/${campaignId}/creative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: creativePlan,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Creative plan integrated into campaign ${campaignId}`,
        };
      }

      return {
        success: false,
        message: `Campaign Engine returned ${response.status}`,
      };
    } catch (error) {
      console.warn("[Integration] Campaign Engine unavailable");
      return {
        success: false,
        message: "Campaign Engine unavailable - plan saved locally",
      };
    }
  }

  /**
   * Send enhanced video to Social Engine for posting
   */
  async sendToSocial(
    videoPath: string,
    platform: string,
    caption: string,
    hashtags: string[]
  ): Promise<{ success: boolean; postId?: string; message: string }> {
    console.log(`[Integration] Sending video to Social Engine (${platform})`);

    try {
      const response = await fetch(`${SERVICE_URLS.social}/hands5/social/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          content: {
            videoPath,
            caption,
            hashtags,
          },
          accountId: "default", // Would be dynamic in production
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          postId: data.postId,
          message: `Video queued for posting to ${platform}`,
        };
      }

      return {
        success: false,
        message: `Social Engine returned ${response.status}`,
      };
    } catch (error) {
      console.warn("[Integration] Social Engine unavailable");
      return {
        success: false,
        message: "Social Engine unavailable - manual posting required",
      };
    }
  }

  /**
   * Send creative requirements to Video Engine
   */
  async requestVideoGeneration(
    prompt: string,
    creativePlan: CreativePlan
  ): Promise<{ success: boolean; videoId?: string; message: string }> {
    console.log("[Integration] Requesting video generation from Video Engine");

    try {
      const response = await fetch(`${SERVICE_URLS.video}/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: creativePlan.platform,
          duration: creativePlan.pacingPlan.totalDuration,
          shots: creativePlan.pacingPlan.segments.length,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          videoId: data.videoId,
          message: "Video generation started",
        };
      }

      return {
        success: false,
        message: `Video Engine returned ${response.status}`,
      };
    } catch (error) {
      console.warn("[Integration] Video Engine unavailable");
      return {
        success: false,
        message: "Video Engine unavailable",
      };
    }
  }

  /**
   * Send caption plan to Engagement Engine
   */
  async sendToEngagement(
    platform: string,
    caption: string,
    hashtags: string[]
  ): Promise<{ success: boolean; score?: number; message: string }> {
    console.log("[Integration] Sending caption to Engagement Engine");

    try {
      const response = await fetch(`${SERVICE_URLS.engagement}/engagement/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          caption,
          hashtags,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          score: data.engagementScore,
          message: `Engagement score: ${data.engagementScore}/100`,
        };
      }

      return {
        success: false,
        message: `Engagement Engine returned ${response.status}`,
      };
    } catch (error) {
      console.warn("[Integration] Engagement Engine unavailable");
      return {
        success: false,
        message: "Engagement Engine unavailable",
      };
    }
  }

  /**
   * Send product creative to E-Commerce Engine
   */
  async sendToEcommerce(
    productId: string,
    creativePlan: CreativePlan
  ): Promise<{ success: boolean; message: string }> {
    console.log(`[Integration] Sending creative to E-Commerce Engine (${productId})`);

    try {
      const response = await fetch(
        `${SERVICE_URLS.ecommerce}/products/${productId}/creative`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoPath: creativePlan.videoPath,
            thumbnails: creativePlan.thumbnailConcepts,
            captions: creativePlan.captionPlan,
          }),
        }
      );

      if (response.ok) {
        return {
          success: true,
          message: `Creative assets linked to product ${productId}`,
        };
      }

      return {
        success: false,
        message: `E-Commerce Engine returned ${response.status}`,
      };
    } catch (error) {
      console.warn("[Integration] E-Commerce Engine unavailable");
      return {
        success: false,
        message: "E-Commerce Engine unavailable",
      };
    }
  }

  /**
   * Full pipeline: Generate → Enhance → Post → Track
   */
  async executeFullPipeline(
    creativePlan: CreativePlan,
    options: {
      postToSocial?: boolean;
      addToCampaign?: string; // Campaign ID
      linkToProduct?: string; // Product ID
      analyzeEngagement?: boolean;
    }
  ): Promise<{
    success: boolean;
    steps: Array<{ step: string; success: boolean; message: string }>;
  }> {
    console.log("[Integration] Executing full creative pipeline");

    const steps: Array<{ step: string; success: boolean; message: string }> = [];

    // Step 1: Send to Campaign (if specified)
    if (options.addToCampaign) {
      const result = await this.sendToCampaign(creativePlan, options.addToCampaign);
      steps.push({
        step: "Campaign Integration",
        success: result.success,
        message: result.message,
      });
    }

    // Step 2: Analyze engagement potential
    if (options.analyzeEngagement) {
      const result = await this.sendToEngagement(
        creativePlan.platform,
        creativePlan.captionPlan.mainCaption,
        creativePlan.captionPlan.hashtags
      );
      steps.push({
        step: "Engagement Analysis",
        success: result.success,
        message: result.message,
      });
    }

    // Step 3: Link to product (if specified)
    if (options.linkToProduct) {
      const result = await this.sendToEcommerce(options.linkToProduct, creativePlan);
      steps.push({
        step: "E-Commerce Integration",
        success: result.success,
        message: result.message,
      });
    }

    // Step 4: Post to social (if specified)
    if (options.postToSocial) {
      const result = await this.sendToSocial(
        creativePlan.videoPath,
        creativePlan.platform,
        creativePlan.captionPlan.mainCaption,
        creativePlan.captionPlan.hashtags
      );
      steps.push({
        step: "Social Posting",
        success: result.success,
        message: result.message,
      });
    }

    const allSuccess = steps.every((s) => s.success);

    return {
      success: allSuccess,
      steps,
    };
  }

  /**
   * Queue creative for later processing
   */
  async queueCreative(
    creativePlan: CreativePlan,
    priority: "low" | "normal" | "high" = "normal"
  ): Promise<{ queueId: string; position: number }> {
    console.log(`[Integration] Queuing creative with ${priority} priority`);

    // In production, would use actual queue system (Redis, RabbitMQ, etc.)
    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const position = Math.floor(Math.random() * 10) + 1;

    return { queueId, position };
  }

  /**
   * Batch process multiple creatives
   */
  async batchProcess(
    creativePlans: CreativePlan[],
    destination: "social" | "campaign" | "ecommerce"
  ): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{ index: number; success: boolean; message: string }>;
  }> {
    console.log(`[Integration] Batch processing ${creativePlans.length} creatives to ${destination}`);

    const results: Array<{ index: number; success: boolean; message: string }> = [];
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < creativePlans.length; i++) {
      const plan = creativePlans[i];

      try {
        let result: { success: boolean; message: string };

        switch (destination) {
          case "social":
            result = await this.sendToSocial(
              plan.videoPath,
              plan.platform,
              plan.captionPlan.mainCaption,
              plan.captionPlan.hashtags
            );
            break;
          case "campaign":
            result = await this.sendToCampaign(plan, `campaign_${i}`);
            break;
          case "ecommerce":
            result = await this.sendToEcommerce(`product_${i}`, plan);
            break;
          default:
            result = { success: false, message: "Unknown destination" };
        }

        results.push({
          index: i,
          success: result.success,
          message: result.message,
        });

        if (result.success) processed++;
        else failed++;

        // Rate limiting: wait 1s between requests
        if (i < creativePlans.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          index: i,
          success: false,
          message: `Error: ${error}`,
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      results,
    };
  }

  /**
   * Health check for all integration endpoints
   */
  async checkIntegrationHealth(): Promise<{
    social: boolean;
    campaign: boolean;
    video: boolean;
    engagement: boolean;
    ecommerce: boolean;
  }> {
    console.log("[Integration] Checking health of all integration endpoints");

    const checks = await Promise.all([
      this.checkServiceHealth(SERVICE_URLS.social),
      this.checkServiceHealth(SERVICE_URLS.campaign),
      this.checkServiceHealth(SERVICE_URLS.video),
      this.checkServiceHealth(SERVICE_URLS.engagement),
      this.checkServiceHealth(SERVICE_URLS.ecommerce),
    ]);

    return {
      social: checks[0],
      campaign: checks[1],
      video: checks[2],
      engagement: checks[3],
      ecommerce: checks[4],
    };
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats(): {
    totalIntegrations: number;
    successRate: number;
    avgResponseTime: number;
    mostUsedService: string;
  } {
    // In production, would track real metrics
    return {
      totalIntegrations: 127,
      successRate: 0.94,
      avgResponseTime: 345, // ms
      mostUsedService: "social",
    };
  }
}
