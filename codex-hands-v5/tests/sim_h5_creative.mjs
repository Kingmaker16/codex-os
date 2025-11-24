// =============================================
// HANDS v5.0 ULTRA — CREATIVE ENGINE TEST
// =============================================

import fetch from "node-fetch";

const BASE_URL = "http://localhost:4350";

async function testCreativeEngine() {
  console.log("\n========================================");
  console.log("HANDS v5.0 ULTRA — CREATIVE ENGINE TEST");
  console.log("========================================\n");

  // Test 1: TikTok Edit Macro
  console.log("Test 1: TikTok video edit macro");
  const tiktokResp = await fetch(`${BASE_URL}/hands5/creative/capcut`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoPath: "/Users/amar/Codex/videos/raw_workout.mp4",
      format: "tiktok"
    })
  });
  const tiktokResult = await tiktokResp.json();
  console.log("TikTok Edit Result:", JSON.stringify(tiktokResult, null, 2));

  // Test 2: Premiere Pro Edit
  console.log("\n\nTest 2: Adobe Premiere Pro edit");
  const premiereResp = await fetch(`${BASE_URL}/hands5/creative/premiere`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "test-creative-1",
      videoPath: "/Users/amar/Codex/videos/raw_video.mp4",
      operations: [
        {
          type: "cut",
          timestamp: 5.0,
          params: {}
        },
        {
          type: "colorGrade",
          params: { preset: "cinematic", intensity: 0.8 }
        },
        {
          type: "addText",
          timestamp: 1.0,
          params: { text: "Hook: Why this works!", position: "top" }
        }
      ],
      exportFormat: "youtube"
    })
  });
  const premiereResult = await premiereResp.json();
  console.log("Premiere Edit Result:", JSON.stringify(premiereResult, null, 2));

  // Test 3: Export Job
  console.log("\n\nTest 3: Start export job");
  const exportResp = await fetch(`${BASE_URL}/hands5/creative/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId: "export-test-1",
      videoPath: "/Users/amar/Codex/videos/edited.prproj",
      format: "mp4"
    })
  });
  const exportResult = await exportResp.json();
  console.log("Export Started:", JSON.stringify(exportResult, null, 2));

  // Wait and check export status
  console.log("\nChecking export status in 3 seconds...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const statusResp = await fetch(`${BASE_URL}/hands5/creative/export/export-test-1`);
  const statusResult = await statusResp.json();
  console.log("Export Status:", JSON.stringify(statusResult, null, 2));

  console.log("\n✅ Creative Engine Tests Complete\n");
}

testCreativeEngine().catch(console.error);
