// =============================================
// H5-SOCIAL: MACRO FLOWS
// =============================================

import { SocialPostRequest, EngagementMacro } from "../types.js";
import { posterEngine } from "./poster.js";
import { commenterEngine } from "./commenter.js";
import { generateId, sleep } from "../utils.js";

export class MacroFlows {
  async uploadAndVerifyFlow(request: SocialPostRequest): Promise<any> {
    console.log("Starting upload and verify flow...");

    // Step 1: Upload
    let uploadResult;
    switch (request.platform) {
      case "tiktok":
        uploadResult = await posterEngine.postToTikTok(request);
        break;
      case "youtube":
        uploadResult = await posterEngine.postToYouTube(request);
        break;
      case "instagram":
        uploadResult = await posterEngine.postToInstagram(request);
        break;
      default:
        return { ok: false, error: "Unsupported platform" };
    }

    if (!uploadResult.ok) {
      return uploadResult;
    }

    // Step 2: Wait for processing
    await sleep(5000);

    // Step 3: Verify
    const verifyResult = request.verify 
      ? await posterEngine.verifyPost(uploadResult.postId, request.platform)
      : { verified: false, message: "Verification skipped" };

    return {
      ok: true,
      flow: "upload-and-verify",
      upload: uploadResult,
      verify: verifyResult
    };
  }

  async multiPlatformPostFlow(
    baseRequest: Omit<SocialPostRequest, "platform">,
    platforms: SocialPostRequest["platform"][]
  ): Promise<any> {
    const results = [];

    for (const platform of platforms) {
      const request: SocialPostRequest = {
        ...baseRequest,
        platform
      };

      const result = await this.uploadAndVerifyFlow(request);
      results.push({ platform, result });

      // Delay between platforms
      await sleep(3000);
    }

    return {
      ok: true,
      flow: "multi-platform-post",
      platforms: platforms.length,
      results
    };
  }

  async postAndEngageFlow(
    postRequest: SocialPostRequest,
    engagementMacros: EngagementMacro[]
  ): Promise<any> {
    // Step 1: Post content
    const postResult = await this.uploadAndVerifyFlow(postRequest);
    if (!postResult.ok) {
      return postResult;
    }

    // Step 2: Wait before engaging
    await sleep(10000);

    // Step 3: Run engagement macros
    const engageResult = await commenterEngine.engagementLoop(engagementMacros, 1);

    return {
      ok: true,
      flow: "post-and-engage",
      post: postResult,
      engagement: engageResult
    };
  }

  async scheduledBatchPostFlow(
    requests: SocialPostRequest[],
    delayMinutes: number = 30
  ): Promise<any> {
    const results = [];
    const delayMs = delayMinutes * 60 * 1000;

    for (let i = 0; i < requests.length; i++) {
      console.log(`Posting ${i + 1}/${requests.length}...`);
      
      const result = await this.uploadAndVerifyFlow(requests[i]);
      results.push(result);

      // Delay between posts (except after last post)
      if (i < requests.length - 1) {
        console.log(`Waiting ${delayMinutes} minutes before next post...`);
        await sleep(Math.min(delayMs, 5000)); // Cap at 5s for simulation
      }
    }

    return {
      ok: true,
      flow: "scheduled-batch-post",
      totalPosts: requests.length,
      results
    };
  }

  async hashtagTestingFlow(
    baseRequest: Omit<SocialPostRequest, "content">,
    content: SocialPostRequest["content"],
    hashtagSets: string[][]
  ): Promise<any> {
    const results = [];

    for (let i = 0; i < hashtagSets.length; i++) {
      const request: SocialPostRequest = {
        ...baseRequest,
        content: {
          ...content,
          hashtags: hashtagSets[i]
        }
      };

      const result = await this.uploadAndVerifyFlow(request);
      results.push({
        hashtagSet: hashtagSets[i],
        result
      });

      await sleep(3000);
    }

    return {
      ok: true,
      flow: "hashtag-testing",
      variants: hashtagSets.length,
      results
    };
  }
}

export const macroFlows = new MacroFlows();
