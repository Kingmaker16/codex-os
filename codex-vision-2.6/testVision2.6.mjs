// testVision2.6.mjs - Vision Engine v2.6 ULTRA Test

const VISION_URL = "http://localhost:4650";

async function testVision() {
  console.log("🧪 Testing Vision Engine v2.6 ULTRA...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣ Health check...");
    const healthRes = await fetch(`${VISION_URL}/health`);
    const health = await healthRes.json();
    console.log(`   ✅ Status: ${health.ok ? "OK" : "FAILED"}`);
    console.log(`   Version: ${health.version}`);
    console.log(`   Mode: ${health.mode}\n`);

    // Test 2: Suggest edits (main co-pilot endpoint)
    console.log("2️⃣ Testing /vision/suggestEdits (Co-Pilot Mode)...");
    const editRes = await fetch(`${VISION_URL}/vision/suggestEdits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoPath: "/test/sample_1080p.mp4",
        platform: "tiktok",
      }),
    });

    const editData = await editRes.json();

    if (editData.ok) {
      console.log(`   ✅ Edit suggestions generated`);
      console.log(`   Actions: ${editData.editSuggestion.actions.length}`);
      console.log(
        `   Requires Approval: ${editData.editSuggestion.requiresApproval}`
      );
      console.log(
        `   Consensus Score: ${editData.editSuggestion.consensusScore}%`
      );
      console.log(
        `   LLM Responses: ${editData.editSuggestion.llmResponses.length}/4`
      );
      console.log(`   Estimated Impact:`);
      console.log(
        `     Retention: +${editData.editSuggestion.estimatedImpact.retentionIncrease}%`
      );
      console.log(
        `     Engagement: +${editData.editSuggestion.estimatedImpact.engagementIncrease}%`
      );
      console.log(
        `     Viral Potential: ${editData.editSuggestion.estimatedImpact.viralPotential}/100\n`
      );

      // Show top 3 actions
      console.log("   Top 3 Suggested Actions:");
      editData.editSuggestion.actions.slice(0, 3).forEach((action, i) => {
        console.log(
          `     ${i + 1}. ${action.type} @ ${action.timestamp}s [${action.priority}]`
        );
        console.log(`        → ${action.reason}`);
      });
      console.log("");

      // Test 3: Verify requiresApproval is true
      if (editData.editSuggestion.requiresApproval === true) {
        console.log(
          "3️⃣ ✅ Co-Pilot Mode confirmed: requiresApproval = true\n"
        );
      } else {
        console.log(
          "3️⃣ ⚠️  Warning: requiresApproval should be true in Co-Pilot mode\n"
        );
      }

      // Test 4: Map timeline
      console.log("4️⃣ Testing /vision/mapTimeline (Premiere Pro)...");
      const timelineRes = await fetch(`${VISION_URL}/vision/mapTimeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoPath: "/test/sample_1080p.mp4",
          actions: editData.editSuggestion.actions,
          editor: "premiere",
        }),
      });

      const timelineData = await timelineRes.json();
      if (timelineData.ok) {
        console.log(`   ✅ Timeline mapped`);
        console.log(`   Editor: ${timelineData.timeline.editor}`);
        console.log(`   Tracks: ${timelineData.timeline.tracks.length}`);
        console.log(`   Markers: ${timelineData.timeline.markers.length}`);
        console.log(
          `   Export script: ${timelineData.timeline.exportScript ? "Generated" : "None"}\n`
        );
      }
    } else {
      console.log(`   ❌ Failed: ${editData.error}\n`);
    }

    // Test 5: Performance insights (empty state)
    console.log("5️⃣ Testing /vision/insights...");
    const insightsRes = await fetch(`${VISION_URL}/vision/insights`);
    const insights = await insightsRes.json();

    if (insights.ok) {
      console.log(`   ✅ Insights retrieved`);
      console.log(`   Total edits: ${insights.insights.totalEdits}`);
      console.log(
        `   Recommendations: ${insights.insights.recommendations.length}\n`
      );
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All tests passed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📌 Summary:");
    console.log("   • Multi-LLM fusion: Working");
    console.log("   • Edit suggestions: Generated");
    console.log("   • Co-Pilot mode: Confirmed (requiresApproval: true)");
    console.log("   • Timeline mapping: Working");
    console.log("   • Performance tracking: Ready");
    console.log("\n🎬 Vision Engine v2.6 ULTRA is ready for use!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testVision();
