import type { StrategyDomain, StrategyPlay } from "./types.js";

/**
 * Base playbook repository for each strategic domain
 * These are foundational plays that can be enhanced by AI models
 */

const BASE_PLAYBOOKS: Record<StrategyDomain, StrategyPlay[]> = {
  ecomm: [
    {
      id: "ecomm-ugc-test",
      domain: "ecomm",
      description: "Launch 3 UGC ads testing 3 different hooks for a single product",
      rationale: "Hook testing is critical for finding winning angles. UGC format has highest engagement on paid social.",
      prerequisites: ["Product selected", "UGC templates ready"],
      riskLevel: "low"
    },
    {
      id: "ecomm-landing-page",
      domain: "ecomm",
      description: "Create a 1-page landing page with focused CTA and product benefits",
      rationale: "Simple landing pages convert better than multi-page sites in early testing phase.",
      prerequisites: ["Product copy", "Product images"],
      riskLevel: "low"
    },
    {
      id: "ecomm-competitor-research",
      domain: "ecomm",
      description: "Research top 5 competitors' pricing, positioning, and offers",
      rationale: "Understanding competitive landscape prevents pricing mistakes and reveals positioning opportunities.",
      prerequisites: [],
      riskLevel: "low"
    },
    {
      id: "ecomm-product-bundle",
      domain: "ecomm",
      description: "Create a bundle offer with 2-3 complementary products at 15% discount",
      rationale: "Bundles increase AOV and reduce decision paralysis for customers.",
      prerequisites: ["Multiple products in catalog"],
      riskLevel: "medium"
    }
  ],
  
  social: [
    {
      id: "social-tiktok-cadence",
      domain: "social",
      description: "Post 2 TikToks/day using UGC templates (problem-solution, testimonial)",
      rationale: "Consistency + template-driven content = algorithm favor. 2/day is sustainable sweet spot.",
      prerequisites: ["TikTok account", "Content templates"],
      riskLevel: "low"
    },
    {
      id: "social-shorts-hook-test",
      domain: "social",
      description: "Test 3 hook variations on YouTube Shorts in same niche",
      rationale: "First 3 seconds determine 80% of retention. Hook testing finds what resonates.",
      prerequisites: ["YouTube channel", "Base content"],
      riskLevel: "low"
    },
    {
      id: "social-trend-hijack",
      domain: "social",
      description: "Create 5 posts hijacking trending audio/format in your niche",
      rationale: "Trend surfing multiplies reach 10-100x during trend peak window.",
      prerequisites: ["Trend monitoring system"],
      riskLevel: "medium"
    },
    {
      id: "social-engagement-loop",
      domain: "social",
      description: "Reply to all comments within 1 hour for 7 days straight",
      rationale: "Engagement signals boost algorithmic reach. Early replies create community momentum.",
      prerequisites: [],
      riskLevel: "low"
    },
    {
      id: "social-cross-platform",
      domain: "social",
      description: "Repurpose top-performing TikTok to Shorts, Reels, and Twitter",
      rationale: "Winners win everywhere. Cross-platform distribution maximizes ROI on best content.",
      prerequisites: ["At least 1 viral post"],
      riskLevel: "low"
    }
  ],
  
  trading: [
    {
      id: "trading-backtesting",
      domain: "trading",
      description: "Backtest strategy on 3 years of historical data with strict entry/exit rules",
      rationale: "Backtesting reveals edge magnitude and drawdown characteristics before risking capital.",
      prerequisites: ["Trading strategy defined", "Historical data"],
      riskLevel: "low"
    },
    {
      id: "trading-paper-trade",
      domain: "trading",
      description: "Execute 30 paper trades following exact strategy rules",
      rationale: "Paper trading validates execution discipline and surfaces psychological friction.",
      prerequisites: ["Backtested strategy"],
      riskLevel: "low"
    },
    {
      id: "trading-micro-position",
      domain: "trading",
      description: "Start with 1% of target position size for first 10 live trades",
      rationale: "Micro positions reduce emotional impact while gathering real execution data.",
      prerequisites: ["Paper trading complete"],
      riskLevel: "medium"
    }
  ],
  
  kingmaker: [
    {
      id: "kingmaker-influence-map",
      domain: "kingmaker",
      description: "Map the top 20 influencers in target niche with engagement rates",
      rationale: "Influencer partnerships 10x reach. Mapping reveals collaboration opportunities.",
      prerequisites: [],
      riskLevel: "low"
    },
    {
      id: "kingmaker-strategic-collab",
      domain: "kingmaker",
      description: "Propose value-add collaboration to 3 mid-tier influencers",
      rationale: "Mid-tier influencers (10k-100k) have higher engagement and reply rates than top-tier.",
      prerequisites: ["Influence map complete"],
      riskLevel: "medium"
    }
  ],
  
  creative: [
    {
      id: "creative-concept-batch",
      domain: "creative",
      description: "Generate 10 video concepts in 30 minutes using templates",
      rationale: "Batch ideation prevents creative block. Volume → quality through selection.",
      prerequisites: ["Video templates available"],
      riskLevel: "low"
    },
    {
      id: "creative-remix-winner",
      domain: "creative",
      description: "Create 3 remixes of your best-performing content",
      rationale: "Winners have replay value. Remix angles extract more value from proven concepts.",
      prerequisites: ["Analytics on past performance"],
      riskLevel: "low"
    },
    {
      id: "creative-ai-image-gen",
      domain: "creative",
      description: "Generate 20 product images with AI for A/B testing different styles",
      rationale: "AI generation enables rapid visual testing without designer bottleneck.",
      prerequisites: ["Product info", "AI image tools"],
      riskLevel: "low"
    }
  ]
};

/**
 * Get base plays for a specific domain
 */
export function getBasePlays(domain: StrategyDomain): StrategyPlay[] {
  return BASE_PLAYBOOKS[domain] || [];
}

/**
 * Get all base plays across all domains
 */
export function getAllBasePlays(): StrategyPlay[] {
  return Object.values(BASE_PLAYBOOKS).flat();
}

/**
 * Merge base plays with AI-suggested plays
 * - Deduplicates by description similarity
 * - Prioritizes AI suggestions for novel plays
 * - Keeps base plays for foundational coverage
 */
export function mergePlays(base: StrategyPlay[], modelSuggestions: StrategyPlay[]): StrategyPlay[] {
  const merged = [...base];
  
  for (const suggestion of modelSuggestions) {
    // Simple deduplication: check if similar play exists
    const isDuplicate = base.some(b => 
      b.description.toLowerCase().includes(suggestion.description.toLowerCase().slice(0, 20)) ||
      suggestion.description.toLowerCase().includes(b.description.toLowerCase().slice(0, 20))
    );
    
    if (!isDuplicate) {
      merged.push(suggestion);
    }
  }
  
  return merged;
}

/**
 * Filter plays by risk level
 */
export function filterByRisk(plays: StrategyPlay[], maxRisk: "low" | "medium" | "high"): StrategyPlay[] {
  const riskOrder = { low: 0, medium: 1, high: 2 };
  const maxLevel = riskOrder[maxRisk];
  
  return plays.filter(p => riskOrder[p.riskLevel] <= maxLevel);
}

/**
 * TODO: Add domain-specific play expansion
 * - Integrate with Knowledge Engine to dynamically generate plays based on recent research
 * - Add time-based plays (seasonal, trending)
 * - Add prerequisite validation logic
 * - Implement play sequencing (what order makes sense)
 */
