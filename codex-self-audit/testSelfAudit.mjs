#!/usr/bin/env node

const BASE_URL = "http://localhost:5530";

async function testHealth() {
  console.log("\n🧪 Test 1: Health Check");
  const resp = await fetch(`${BASE_URL}/health`);
  const data = await resp.json();
  console.log("✅ Service:", data.service);
  console.log("✅ Capabilities:", data.capabilities.length);
}

async function testLogicValidation() {
  console.log("\n🧪 Test 2: Logic Validation (Missing Step)");
  const resp = await fetch(`${BASE_URL}/audit/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "test-logic-1",
      content: "Step 1: Initialize. Step 3: Deploy.",
      contentType: "plan",
      enableLLMValidation: false,
      enableSafetyCheck: false
    })
  });
  const data = await resp.json();
  console.log("✅ Findings:", data.report.findings.length);
  console.log("✅ Finding type:", data.report.findings[0]?.type);
  console.log("✅ Quality score:", data.report.qualityScore.overall);
}

async function testContradiction() {
  console.log("\n🧪 Test 3: Contradiction Detection");
  const resp = await fetch(`${BASE_URL}/audit/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "test-contradiction-1",
      content: "The feature will be enabled automatically. The feature will not be enabled without approval.",
      contentType: "output",
      enableLLMValidation: false,
      enableSafetyCheck: false
    })
  });
  const data = await resp.json();
  console.log("✅ Findings:", data.report.findings.length);
  console.log("✅ Finding type:", data.report.findings[0]?.type);
  console.log("✅ Should block:", data.report.shouldBlock);
}

async function testBatch() {
  console.log("\n🧪 Test 4: Batch Audit");
  const resp = await fetch(`${BASE_URL}/audit/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        {
          sessionId: "batch-1",
          content: "This is a good plan.",
          contentType: "plan",
          enableLLMValidation: false
        },
        {
          sessionId: "batch-2",
          content: "Step 1: Do something. Step 5: Complete.",
          contentType: "plan",
          enableLLMValidation: false
        }
      ]
    })
  });
  const data = await resp.json();
  console.log("✅ Total reports:", data.summary.total);
  console.log("✅ Passed:", data.summary.passed);
  console.log("✅ Warnings:", data.summary.warnings);
}

async function testHistory() {
  console.log("\n🧪 Test 5: Audit History");
  const resp = await fetch(`${BASE_URL}/audit/history?limit=3`);
  const data = await resp.json();
  console.log("✅ History count:", data.count);
  console.log("✅ Recent audits:", data.history.length);
}

async function main() {
  console.log("🚀 Self-Audit Engine v1 ULTRA Test Suite");
  console.log("==========================================");

  try {
    await testHealth();
    await testLogicValidation();
    await testContradiction();
    await testBatch();
    await testHistory();
    
    console.log("\n✅ All tests passed!");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
    process.exit(1);
  }
}

main();
