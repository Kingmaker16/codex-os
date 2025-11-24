import { OptimizationRequest, OptimizationResult, OptimizationInsight, ServiceHealth } from "../types.js";
import { fetchKPIsFromServices } from "./kpiTracker.js";
import { generateCorrections, prioritizeCorrections } from "./correctionEngine.js";
import { designABTests } from "./abTestEngine.js";
import { generateOptimizationReasoning } from "./reasoningEngine.js";
import { SocialOptimizer } from "./domainOptimizers/social.js";
import { EcommOptimizer } from "./domainOptimizers/ecomm.js";
import { VideoOptimizer } from "./domainOptimizers/video.js";
import { TrendsOptimizer } from "./domainOptimizers/trends.js";
import { MonetizationOptimizer } from "./domainOptimizers/monetization.js";
import { CampaignsOptimizer } from "./domainOptimizers/campaigns.js";
import { checkServiceHealth } from "../integration/serviceClients.js";

const OPTIMIZERS = [
  new SocialOptimizer(),
  new EcommOptimizer(),
  new VideoOptimizer(),
  new TrendsOptimizer(),
  new MonetizationOptimizer(),
  new CampaignsOptimizer()
];

export async function runOptimization(req: OptimizationRequest): Promise<OptimizationResult> {
  const timestamp = new Date().toISOString();
  
  // 1. Fetch KPIs
  const kpis = await fetchKPIsFromServices(req.domain);
  
  // 2. Check service health
  const serviceHealth = await checkServiceHealth();
  
  // 3. Run domain-specific optimizers
  let insights: OptimizationInsight[] = [];
  
  if (req.domain === "all") {
    for (const optimizer of OPTIMIZERS) {
      const domainInsights = await optimizer.analyze(kpis, serviceHealth);
      insights.push(...domainInsights);
    }
  } else {
    const optimizer = OPTIMIZERS.find(o => o.domain === req.domain);
    if (optimizer) {
      insights = await optimizer.analyze(kpis, serviceHealth);
    }
  }
  
  // 4. Generate corrections
  const corrections = prioritizeCorrections(generateCorrections(req.domain, kpis));
  
  // 5. Design A/B tests (if requested)
  let abTests = undefined;
  if (req.includeABTests) {
    abTests = designABTests(req.domain, kpis);
  }
  
  // 6. Get LLM consensus reasoning
  const kpiSummary = kpis.map(k => 
    `${k.name}: ${k.value} ${k.unit}${k.delta ? ` (${k.delta > 0 ? '+' : ''}${k.delta})` : ''}`
  ).join("\n");
  
  const llmConsensus = await generateOptimizationReasoning(req.domain, kpiSummary);
  
  // 7. Calculate confidence
  const healthyServices = serviceHealth.filter(s => s.healthy).length;
  const confidence = healthyServices / serviceHealth.length;
  
  return {
    ok: true,
    sessionId: req.sessionId,
    domain: req.domain,
    timestamp,
    kpis,
    insights,
    corrections,
    abTests,
    serviceHealth,
    llmConsensus,
    confidence
  };
}
