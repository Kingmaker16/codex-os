// Content Routing Engine v2 ULTRA - Routing Tests

import http from 'http';

const BASE_URL = 'http://localhost:5560';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testRouting() {
  console.log('\n🧪 Testing Content Routing Engine v2 ULTRA...\n');

  // Test 1: Health check
  console.log('1️⃣ Health Check');
  const health = await request('GET', '/health');
  console.log(health.status === 200 ? '✅ PASS' : '❌ FAIL', '- Health endpoint');

  // Test 2: Analyze route
  console.log('\n2️⃣ Analyze Route');
  const content = {
    id: 'test-content-001',
    type: 'short',
    duration: 30,
    language: 'en',
    title: 'Viral dance challenge video',
    description: 'Trending dance moves with upbeat music',
    metadata: { category: 'entertainment' }
  };

  const analyzeResponse = await request('POST', '/routing/analyze', {
    contentId: content.id,
    content,
    targetPlatforms: ['tiktok', 'youtube', 'instagram'],
    trendWeighted: true
  });

  const routeId = analyzeResponse.data.routeId;
  console.log(analyzeResponse.status === 200 ? '✅ PASS' : '❌ FAIL', `- Route analysis (ID: ${routeId})`);
  console.log(`   Top platform: ${analyzeResponse.data.topRoute?.platform}`);
  console.log(`   Score: ${analyzeResponse.data.topRoute?.score?.toFixed(3)}`);

  // Test 3: Get scores
  console.log('\n3️⃣ Get Platform Scores');
  const scoresResponse = await request('POST', '/routing/scores', {
    content,
    platforms: ['tiktok', 'youtube', 'instagram', 'twitter']
  });
  console.log(scoresResponse.status === 200 ? '✅ PASS' : '❌ FAIL', `- Platform scoring (${scoresResponse.data.scores?.length} platforms)`);

  // Test 4: Simulate route
  console.log('\n4️⃣ Simulate Route');
  const simResponse = await request('POST', '/routing/simulate', {
    routeId,
    routeIndex: 0
  });
  console.log(simResponse.status === 200 ? '✅ PASS' : '❌ FAIL', '- Route simulation');
  console.log(`   Predicted reach: ${simResponse.data.predictedReach?.toLocaleString()}`);
  console.log(`   Success probability: ${(simResponse.data.successProbability * 100)?.toFixed(1)}%`);

  // Test 5: Quick route
  console.log('\n5️⃣ Quick Route Recommendation');
  const quickResponse = await request('POST', '/routing/quick', { content });
  console.log(quickResponse.status === 200 ? '✅ PASS' : '❌ FAIL', `- Quick routing → ${quickResponse.data.platform}`);

  // Test 6: Recommend
  console.log('\n6️⃣ Best Platform Recommendation');
  const recommendResponse = await request('POST', '/routing/recommend', { content });
  console.log(recommendResponse.status === 200 ? '✅ PASS' : '❌ FAIL', '- Platform recommendation');
  console.log(`   Recommended: ${recommendResponse.data.recommended?.platform}`);
  console.log(`   Confidence: ${(recommendResponse.data.recommended?.confidence * 100)?.toFixed(1)}%`);

  // Test 7: Compare platforms
  console.log('\n7️⃣ Compare Platforms');
  const compareResponse = await request('POST', '/routing/compare', {
    content,
    platforms: ['tiktok', 'youtube', 'instagram']
  });
  console.log(compareResponse.status === 200 ? '✅ PASS' : '❌ FAIL', '- Platform comparison');
  compareResponse.data.comparison?.forEach(c => {
    console.log(`   ${c.rank}. ${c.platform} (${c.score.toFixed(3)})`);
  });

  // Test 8: Get status
  console.log('\n8️⃣ Get Route Status');
  const statusResponse = await request('GET', `/routing/status/${routeId}`);
  console.log(statusResponse.status === 200 ? '✅ PASS' : '❌ FAIL', `- Status: ${statusResponse.data.status}`);

  console.log('\n✅ All routing tests complete!\n');
}

testRouting().catch(console.error);
