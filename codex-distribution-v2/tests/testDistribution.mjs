import axios from "axios";

const BASE_URL = "http://localhost:5301";

async function testDistributionEngine() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 TESTING: Distribution Engine v2 ULTRA");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    console.log("Test 1: Health Check");
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.ok && response.data.version === "2.0.0") {
      console.log("✅ PASSED - Service healthy\n");
      passed++;
    } else {
      console.log("❌ FAILED - Unexpected health response\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Health check error:", error.message, "\n");
    failed++;
  }

  // Test 2: Create Distribution Plan
  let planId;
  try {
    console.log("Test 2: Create Distribution Plan");
    const response = await axios.post(`${BASE_URL}/distribution/create`, {
      contentId: "test-content-001",
      platforms: ["tiktok", "youtube", "instagram"],
      languages: ["en", "es"],
      velocity: 1.5,
      trendWeighted: true
    });
    if (response.data.ok && response.data.plan) {
      planId = response.data.plan.id;
      console.log("✅ PASSED - Plan created:", planId, "\n");
      passed++;
    } else {
      console.log("❌ FAILED - Plan creation failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Create plan error:", error.message, "\n");
    failed++;
  }

  // Test 3: Generate Distribution Plan
  try {
    console.log("Test 3: Generate Distribution Plan");
    const response = await axios.post(`${BASE_URL}/distribution/plan`, {
      planId
    });
    if (response.data.ok && response.data.calendar) {
      console.log("✅ PASSED - Calendar generated with", response.data.calendar.slots.length, "slots\n");
      passed++;
    } else {
      console.log("❌ FAILED - Plan generation failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Generate plan error:", error.message, "\n");
    failed++;
  }

  // Test 4: Get Plan Status
  try {
    console.log("Test 4: Get Plan Status");
    const response = await axios.get(`${BASE_URL}/distribution/status?planId=${planId}`);
    if (response.data.ok && response.data.plan) {
      console.log("✅ PASSED - Plan status:", response.data.plan.status, "\n");
      passed++;
    } else {
      console.log("❌ FAILED - Status check failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Status error:", error.message, "\n");
    failed++;
  }

  // Test 5: Simulate Distribution
  try {
    console.log("Test 5: Simulate Distribution");
    const response = await axios.post(`${BASE_URL}/distribution/simulate`, {
      planId
    });
    if (response.data.ok && response.data.simulation) {
      console.log("✅ PASSED - Simulation complete:", response.data.simulation.recommendedAction, "\n");
      passed++;
    } else {
      console.log("❌ FAILED - Simulation failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Simulation error:", error.message, "\n");
    failed++;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(failed > 0 ? 1 : 0);
}

testDistributionEngine();
