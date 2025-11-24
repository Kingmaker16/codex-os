// =============================================
// CREATIVE SUITE v1.5 — BRAND VOICE CHECKER
// =============================================

import { BrandVoiceCheck } from "./types.js";

const BRAND_GUIDELINES = {
  tone: ["authentic", "educational", "entertaining", "transparent"],
  avoid: ["pushy", "salesy", "over-hyped", "clickbait", "misleading"],
  keywords: ["real", "honest", "tested", "results", "experience", "recommend"],
  prohibitedPhrases: [
    "buy now",
    "limited time",
    "act fast",
    "you need this",
    "everyone is buying"
  ],
  contentPillars: [
    "product_reviews",
    "lifestyle_integration",
    "educational_content",
    "behind_the_scenes",
    "community_engagement"
  ]
};

export function checkBrandVoice(
  script: string,
  captions: string[],
  thumbnailText: string
): BrandVoiceCheck {
  console.log("[BrandVoice] Checking brand compliance...");

  const violations: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for prohibited phrases
  const allText = [script, ...captions, thumbnailText].join(" ").toLowerCase();
  
  for (const phrase of BRAND_GUIDELINES.prohibitedPhrases) {
    if (allText.includes(phrase.toLowerCase())) {
      violations.push(`Prohibited phrase detected: "${phrase}"`);
      score -= 15;
    }
  }

  // Check tone (should avoid certain words)
  for (const avoidTone of BRAND_GUIDELINES.avoid) {
    if (allText.includes(avoidTone)) {
      violations.push(`Tone issue: Content feels too ${avoidTone}`);
      score -= 10;
    }
  }

  // Check for brand keywords (bonus points)
  let keywordCount = 0;
  for (const keyword of BRAND_GUIDELINES.keywords) {
    if (allText.includes(keyword)) {
      keywordCount++;
    }
  }

  if (keywordCount < 2) {
    suggestions.push("Add more brand keywords: 'real', 'honest', 'tested', 'results'");
    score -= 5;
  }

  // Check if content is too short (less authentic)
  if (script.split(" ").length < 50) {
    suggestions.push("Consider expanding script for more authentic storytelling");
    score -= 5;
  }

  // Detect tone
  let detectedTone: BrandVoiceCheck["tone"] = "authentic";
  if (allText.includes("learn") || allText.includes("how to")) {
    detectedTone = "educational";
  } else if (allText.includes("fun") || allText.includes("exciting")) {
    detectedTone = "entertaining";
  } else if (allText.includes("buy") || allText.includes("offer")) {
    detectedTone = "sales";
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    compliant: score >= 70,
    score,
    violations,
    suggestions,
    tone: detectedTone
  };
}

export function generateBrandVoiceGuideline(niche: string): string {
  return `
AMAR'S BRAND VOICE GUIDELINES FOR ${niche.toUpperCase()}

✅ DO:
- Be authentic and transparent about experiences
- Share real results and honest opinions
- Focus on educational value
- Tell personal stories
- Build trust through consistency

❌ DON'T:
- Use high-pressure sales tactics
- Make exaggerated claims
- Use clickbait or misleading hooks
- Push products without context
- Ignore community feedback

🎯 TONE: Friendly expert, relatable, trustworthy
🎨 STYLE: Natural, conversational, informative
📱 FORMAT: Story-driven, visual, engaging
  `.trim();
}

export function suggestBrandVoiceImprovements(
  currentScript: string,
  violations: string[]
): string[] {
  const improvements: string[] = [];

  if (violations.some(v => v.includes("pushy"))) {
    improvements.push("Reframe CTA as helpful suggestion instead of demand");
    improvements.push("Add personal experience context before product mention");
  }

  if (violations.some(v => v.includes("clickbait"))) {
    improvements.push("Use specific, accurate hook instead of vague teaser");
    improvements.push("Lead with value proposition, not curiosity gap");
  }

  if (currentScript.length < 100) {
    improvements.push("Expand story with personal details and context");
    improvements.push("Add 'why this matters' section for authenticity");
  }

  return improvements;
}
