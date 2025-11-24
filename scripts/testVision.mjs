#!/usr/bin/env node

/**
 * Vision Engine v2 - Test Script
 * 
 * Validates vision analysis capabilities
 */

const BASE_URL = "http://localhost:4600";

// Test 1: Health check
async function testHealth() {
  console.log("\n🔍 Test 1: Health Check");
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health:", data);
    return data.status === "ok" && data.engine === "vision-v2";
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    return false;
  }
}

// Test 2: Image analysis (with placeholder base64)
async function testImageAnalysis() {
  console.log("\n🔍 Test 2: Image Analysis");
  try {
    // Minimal 1x1 PNG in base64
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await fetch(`${BASE_URL}/vision/analyzeImage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: testImage,
        mode: "general"
      })
    });
    
    const data = await response.json();
    console.log("✅ Image analysis completed");
    console.log("   Models:", data.data?.models?.length || 0);
    console.log("   Confidence:", data.data?.confidence || 0);
    return data.success === true;
  } catch (err) {
    console.error("❌ Image analysis failed:", err.message);
    return false;
  }
}

// Test 3: OCR
async function testOCR() {
  console.log("\n🔍 Test 3: OCR");
  try {
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await fetch(`${BASE_URL}/vision/ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: testImage
      })
    });
    
    const data = await response.json();
    console.log("✅ OCR completed");
    console.log("   Blocks:", data.data?.blocks?.length || 0);
    return data.success === true;
  } catch (err) {
    console.error("❌ OCR failed:", err.message);
    return false;
  }
}

// Test 4: Object detection
async function testObjectDetection() {
  console.log("\n🔍 Test 4: Object Detection");
  try {
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await fetch(`${BASE_URL}/vision/objects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: testImage
      })
    });
    
    const data = await response.json();
    console.log("✅ Object detection completed");
    console.log("   Objects found:", data.data?.length || 0);
    return data.success === true;
  } catch (err) {
    console.error("❌ Object detection failed:", err.message);
    return false;
  }
}

// Test 5: Chart analysis
async function testChartAnalysis() {
  console.log("\n🔍 Test 5: Chart Analysis");
  try {
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await fetch(`${BASE_URL}/vision/chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chart: testImage,
        type: "candlestick"
      })
    });
    
    const data = await response.json();
    console.log("✅ Chart analysis completed");
    console.log("   Patterns:", data.data?.patterns?.length || 0);
    console.log("   Signals:", data.data?.signals?.length || 0);
    return data.success === true;
  } catch (err) {
    console.error("❌ Chart analysis failed:", err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Vision Engine v2 - Test Suite       ║");
  console.log("╚════════════════════════════════════════╝");

  const results = {
    health: await testHealth(),
    imageAnalysis: await testImageAnalysis(),
    ocr: await testOCR(),
    objectDetection: await testObjectDetection(),
    chartAnalysis: await testChartAnalysis()
  };

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  console.log("\n╔════════════════════════════════════════╗");
  console.log(`║   Results: ${passed}/${total} tests passed           ║`);
  console.log("╚════════════════════════════════════════╝\n");

  if (passed === total) {
    console.log("✅ Vision Engine v2 Installed Successfully.\n");
  } else {
    console.log("⚠️  Some tests failed. Check service logs.\n");
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});
