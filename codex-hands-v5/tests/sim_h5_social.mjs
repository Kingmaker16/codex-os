// =============================================
// HANDS v5.0 ULTRA — SOCIAL ENGINE TEST
// =============================================

import fetch from "node-fetch";

const BASE_URL = "http://localhost:4350";

async function testSocialEngine() {
  console.log("\n========================================");
  console.log("HANDS v5.0 ULTRA — SOCIAL ENGINE TEST");
  console.log("========================================\n");

  // Test 1: Single Platform Post
  console.log("Test 1: Post to TikTok");
  const postResp = await fetch(`${BASE_URL}/hands5/social/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "test-social-1",
      platform: "tiktok",
      accountId: "acc-safe-123",
      content: {
        caption: "Morning workout routine 🔥",
        videoPath: "/Users/amar/Codex/videos/workout.mp4",
        hashtags: ["fitness", "workout", "health"]
      },
      verify: true
    })
  });
  const postResult = await postResp.json();
  console.log("Post Result:", JSON.stringify(postResult, null, 2));

  // Test 2: Engagement Macro
  console.log("\n\nTest 2: Comment engagement macro");
  const commentResp = await fetch(`${BASE_URL}/hands5/social/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      macro: {
        id: "comment-1",
        type: "comment",
        target: "video-456",
        message: "Great content! Love the energy 💪"
      }
    })
  });
  const commentResult = await commentResp.json();
  console.log("Comment Result:", JSON.stringify(commentResult, null, 2));

  // Test 3: Multi-Platform Post Flow
  console.log("\n\nTest 3: Multi-platform posting macro");
  const macroResp = await fetch(`${BASE_URL}/hands5/social/macro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flow: "multi-platform",
      baseRequest: {
        sessionId: "test-multi-1",
        accountId: "acc-safe-123",
        content: {
          caption: "Check out my new product!",
          videoPath: "/Users/amar/Codex/videos/product.mp4",
          hashtags: ["product", "launch"]
        },
        verify: true
      },
      platforms: ["tiktok", "youtube", "instagram"]
    })
  });
  const macroResult = await macroResp.json();
  console.log("Multi-Platform Result:", JSON.stringify(macroResult, null, 2));

  console.log("\n✅ Social Engine Tests Complete\n");
}

testSocialEngine().catch(console.error);
