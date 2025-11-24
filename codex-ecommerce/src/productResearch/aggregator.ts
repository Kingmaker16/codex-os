/**
 * E-Commerce Engine v2 - Research Aggregator
 * Combines data from TikTok, competitors, and Google Trends
 */

import { scanTikTokProducts, analyzeTikTokTrend } from './tiktokScanner.js';
import { scanCompetitor, compareCompetitors } from './competitorScanner.js';
import { analyzeGoogleTrends, findRelatedProducts } from './googleTrends.js';
import { logger } from '../utils/logger.js';
import storeDB from '../db/storeDB.js';
import { generateId } from '../utils/validator.js';

export interface ResearchRequest {
  query: string;
  includeTikTok?: boolean;
  includeCompetitors?: boolean;
  includeGoogleTrends?: boolean;
  competitorUrls?: string[];
}

export interface AggregatedResearch {
  query: string;
  tiktokProducts?: any[];
  trendScore?: number;
  competitorInsights?: any;
  googleTrends?: any;
  recommendations?: string[];
  estimatedProfitMargin?: number;
}

export async function aggregateResearch(request: ResearchRequest): Promise<{ ok: boolean; data?: AggregatedResearch; error?: string }> {
  try {
    const {
      query,
      includeTikTok = true,
      includeCompetitors = true,
      includeGoogleTrends = true,
      competitorUrls = []
    } = request;

    logger.info(`Starting aggregated research for: ${query}`);

    const results: AggregatedResearch = { query };

    // TikTok research
    if (includeTikTok) {
      const tiktokResult = await scanTikTokProducts(query, 5);
      if (tiktokResult.ok) {
        results.tiktokProducts = tiktokResult.products;
      }

      const trendResult = await analyzeTikTokTrend(query);
      if (trendResult.ok) {
        results.trendScore = trendResult.trendScore;
      }
    }

    // Competitor research
    if (includeCompetitors && competitorUrls.length > 0) {
      const compResult = await compareCompetitors(competitorUrls);
      if (compResult.ok) {
        results.competitorInsights = compResult.comparison;
      }
    }

    // Google Trends research
    if (includeGoogleTrends) {
      const trendsResult = await analyzeGoogleTrends(query);
      if (trendsResult.ok) {
        results.googleTrends = trendsResult.data;
      }
    }

    // Generate recommendations
    results.recommendations = generateRecommendations(results);
    results.estimatedProfitMargin = calculateProfitMargin(results);

    // Cache the research results
    const cacheId = generateId('research');
    storeDB.cacheResearch(cacheId, 'aggregated', query, results);

    logger.info(`Research aggregation complete for: ${query}`);

    return { ok: true, data: results };
  } catch (error: any) {
    logger.error('Research aggregation failed', error);
    return { ok: false, error: error.message };
  }
}

function generateRecommendations(research: AggregatedResearch): string[] {
  const recommendations: string[] = [];

  // TikTok-based recommendations
  if (research.trendScore && research.trendScore > 75) {
    recommendations.push('High TikTok trend score - prioritize this product');
    recommendations.push('Create UGC-style product videos');
  }

  // Competitor-based recommendations
  if (research.competitorInsights) {
    recommendations.push('Study competitor pricing strategies');
    recommendations.push('Implement features competitors are missing');
  }

  // Google Trends recommendations
  if (research.googleTrends) {
    if (research.googleTrends.competition === 'low') {
      recommendations.push('Low competition - good opportunity');
    }
    recommendations.push('Target related search queries for SEO');
  }

  // General recommendations
  recommendations.push('Start with 2-3 product variants');
  recommendations.push('Set pricing 15-20% below competitors initially');
  recommendations.push('Focus on mobile-first design');

  return recommendations;
}

function calculateProfitMargin(research: AggregatedResearch): number {
  // Mock profit margin calculation
  let margin = 35; // Base 35%

  if (research.trendScore && research.trendScore > 80) {
    margin += 10; // High demand allows higher margins
  }

  if (research.googleTrends?.competition === 'low') {
    margin += 5; // Less competition = better margins
  }

  return Math.min(margin, 60); // Cap at 60%
}
