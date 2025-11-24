// =============================================
// HANDS v5.0 ULTRA — CORE ENGINE TEST
// =============================================

import fetch from "node-fetch";

const BASE_URL = "http://localhost:4350";

async function testCoreEngine() {
  console.log("\n========================================");
  console.log("HANDS v5.0 ULTRA — CORE ENGINE TEST");
  console.log("========================================\n");

  // Test 1: Single Action Execution
  console.log("Test 1: Execute single click action");
  const singleActionResp = await fetch(`${BASE_URL}/hands5/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "test-click-1",
      type: "ACTION",
      actionType: "click",
      params: { x: 100, y: 200 }
    })
  });
  const singleResult = await singleActionResp.json();
  console.log("Result:", JSON.stringify(singleResult, null, 2));

  // Test 2: Action Chain with Dependencies
  console.log("\n\nTest 2: Execute action chain with dependencies");
  const chainResp = await fetch(`${BASE_URL}/hands5/chain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "TikTok Upload Chain",
      nodes: [
        {
          id: "step1",
          type: "ACTION",
          actionType: "openApp",
          params: { appName: "TikTok" }
        },
        {
          id: "step2",
          type: "ACTION",
          actionType: "click",
          params: { x: 500, y: 800 },
          dependsOn: ["step1"]
        },
        {
          id: "step3",
          type: "ACTION",
          actionType: "type",
          params: { text: "Amazing workout routine! #fitness" },
          dependsOn: ["step2"]
        }
      ]
    })
  });
  const chainResult = await chainResp.json();
  console.log("Chain Result:", JSON.stringify(chainResult, null, 2));

  // Test 3: Safety Validation
  console.log("\n\nTest 3: Validate action safety");
  const validateResp = await fetch(`${BASE_URL}/hands5/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "openApp",
      params: { appName: "Adobe Premiere Pro" }
    })
  });
  const validateResult = await validateResp.json();
  console.log("Validation Result:", JSON.stringify(validateResult, null, 2));

  console.log("\n✅ Core Engine Tests Complete\n");
}

testCoreEngine().catch(console.error);
