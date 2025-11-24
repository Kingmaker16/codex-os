#!/usr/bin/env node

/**
 * Codex Diagnostics v1 - Test Script
 * 
 * Verifies diagnostics system is working correctly.
 */

async function testDiagnostics() {
  console.log("🧪 Testing Codex Diagnostics v1...\n");

  try {
    // Test 1: Endpoint availability
    console.log("1️⃣ Testing /diagnostics/run endpoint...");
    const startTime = Date.now();
    
    const response = await fetch("http://localhost:4200/diagnostics/run", {
      method: "POST"
    });
    
    if (!response.ok) {
      console.error(`   ❌ HTTP ${response.status}: ${response.statusText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`   ✅ Endpoint responding (${duration}s)\n`);
    
    // Test 2: Report structure
    console.log("2️⃣ Validating report structure...");
    
    if (!data.ok || !data.report) {
      console.error("   ❌ Invalid response structure");
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
    const { report } = data;
    
    if (!report.runId || !report.results || !Array.isArray(report.results)) {
      console.error("   ❌ Missing required fields in report");
      process.exit(1);
    }
    
    console.log(`   ✅ Valid report structure\n`);
    
    // Test 3: Results summary
    console.log("3️⃣ Analyzing test results...");
    console.log(`   Run ID: ${report.runId}`);
    console.log(`   Duration: ${report.startedAt} → ${report.finishedAt}`);
    console.log(`   Total tests: ${report.results.length}\n`);
    
    const passCount = report.results.filter(r => r.status === "pass").length;
    const failCount = report.results.filter(r => r.status === "fail").length;
    const warnCount = report.results.filter(r => r.status === "warn").length;
    
    console.log(`   📊 Results:`);
    console.log(`      ✅ Pass: ${passCount}`);
    console.log(`      ❌ Fail: ${failCount}`);
    console.log(`      ⚠️  Warn: ${warnCount}\n`);
    
    // Test 4: Individual test details
    console.log("4️⃣ Test Details:");
    
    for (const result of report.results) {
      const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️ ";
      console.log(`   ${icon} ${result.name} (${result.component})`);
      console.log(`      Message: ${result.message}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
    
    console.log();
    
    // Test 5: Health assessment
    console.log("5️⃣ System Health Assessment:");
    
    if (failCount === 0 && warnCount <= 1) {
      console.log("   🎉 All systems operational!\n");
    } else if (failCount > 0) {
      console.log(`   ⚠️  ${failCount} critical failure(s) detected\n`);
    } else {
      console.log(`   ✅ System operational with ${warnCount} warning(s)\n`);
    }
    
    // Test 6: State file
    console.log("6️⃣ Checking diagnostics state...");
    
    try {
      const fs = await import("fs/promises");
      const stateFile = "/Users/amar/Codex/.codex-diagnostics-state.json";
      const stateData = await fs.readFile(stateFile, "utf-8");
      const state = JSON.parse(stateData);
      
      console.log(`   ✅ State file exists`);
      console.log(`      Last run: ${state.lastRunId || "N/A"}`);
      console.log(`      Trading failures: ${state.consecutiveTradingFailures}`);
    } catch (err) {
      console.log("   ⚠️  State file not yet created (expected on first run)");
    }
    
    console.log();
    
    // Final summary
    console.log("╔════════════════════════════════════════╗");
    if (failCount === 0) {
      console.log("║   ✅ DIAGNOSTICS TEST PASSED          ║");
    } else {
      console.log("║   ⚠️  DIAGNOSTICS TEST COMPLETED      ║");
    }
    console.log("╚════════════════════════════════════════╝\n");
    
    process.exit(failCount > 0 ? 1 : 0);
    
  } catch (err) {
    console.error("\n❌ Test failed with error:");
    console.error(err);
    process.exit(1);
  }
}

testDiagnostics();
