// Content Routing Engine v2 ULTRA - Scoring Tests

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

async function testScoring() {
  console.log('\n🧪 Testing Scoring Engines...\n');

  // Test 1: TikTok short video (should score high)
  console.log('1️⃣ TikTok-Optimized Content');
  const tiktokContent = {
    id: 'tiktok-test-001',
    type: 'short',
    duration: 25,
    language: 'en',
    title: 'Quick cooking hack',
    description: 'Viral food trend'
  };

  const tiktokScores = await request('POST', '/routing/scores', {
    content: tiktokContent,
    platforms: ['tiktok', 'youtube', 'instagram']
  });

  console.log('Platform scores:');
  tiktokScores.data.scores?.forEach(s => {
    console.log(`  ${s.platform}: ${s.totalScore.toFixed(3)} (trend: ${s.breakdown.trend.toFixed(2)}, visibility: ${s.breakdown.visibility.toFixed(2)})`);
  });

  const tiktokWins = tiktokScores.data.scores?.[0]?.platform === 'tiktok';
  console.log(tiktokWins ? '✅ PASS' : '⚠️  WARN', '- TikTok should score highest for short content');

  // Test 2: YouTube long video (should score high)
  console.log('\n2️⃣ YouTube-Optimized Content');
  const youtubeContent = {
    id: 'youtube-test-001',
    type: 'long',
    duration: 600,
    language: 'en',
    title: 'Complete tutorial on web development',
    description: 'Comprehensive 10-minute guide'
  };

  const youtubeScores = await request('POST', '/routing/scores', {
    content: youtubeContent,
    platforms: ['tiktok', 'youtube', 'instagram']
  });

  console.log('Platform scores:');
  youtubeScores.data.scores?.forEach(s => {
    console.log(`  ${s.platform}: ${s.totalScore.toFixed(3)} (visibility: ${s.breakdown.visibility.toFixed(2)}, velocity: ${s.breakdown.velocity.toFixed(2)})`);
  });

  const youtubeHighScore = youtubeScores.data.scores?.find(s => s.platform === 'youtube')?.totalScore > 0.4;
  console.log(youtubeHighScore ? '✅ PASS' : '⚠️  WARN', '- YouTube should score well for long content');

  // Test 3: Batch routing
  console.log('\n3️⃣ Batch Routing');
  const batchContents = [
    { id: 'batch-1', type: 'short', duration: 20, language: 'en', title: 'Quick tip' },
    { id: 'batch-2', type: 'long', duration: 300, language: 'es', title: 'Tutorial completo' },
    { id: 'batch-3', type: 'post', language: 'en', title: 'Motivational quote' }
  ];

  const batchResponse = await request('POST', '/routing/batch', {
    contents: batchContents
  });

  console.log(batchResponse.status === 200 ? '✅ PASS' : '❌ FAIL', `- Batch routing (${batchResponse.data.count} items)`);
  batchResponse.data.results?.forEach(r => {
    console.log(`  ${r.contentId} → ${r.topRoute.platform} (${r.topRoute.score.toFixed(3)})`);
  });

  // Test 4: LLM Consensus
  console.log('\n4️⃣ LLM Consensus');
  const consensusContent = {
    id: 'consensus-test-001',
    type: 'short',
    duration: 30,
    language: 'en',
    title: 'Breaking tech news',
    description: 'Latest AI developments'
  };

  const consensusResponse = await request('POST', '/routing/llm-consensus', {
    content: consensusContent
  });

  console.log(consensusResponse.status === 200 ? '✅ PASS' : '❌ FAIL', '- LLM consensus');
  console.log(`  Top choice: ${consensusResponse.data.consensus?.topChoice}`);
  console.log(`  Agreement: ${(consensusResponse.data.consensus?.agreement * 100)?.toFixed(1)}%`);
  console.log(`  Confidence: ${(consensusResponse.data.consensus?.confidence * 100)?.toFixed(1)}%`);

  console.log('\n✅ All scoring tests complete!\n');
}

testScoring().catch(console.error);
