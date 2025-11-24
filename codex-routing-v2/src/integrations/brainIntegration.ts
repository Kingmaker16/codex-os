// Content Routing Engine v2 ULTRA - Brain v2 Integration

import axios from 'axios';
import { CONFIG } from '../config.js';

export async function logRoutingEvent(domain: string, event: any): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.BRAIN_V2}/memory/store`, {
      domain,
      event,
      timestamp: new Date().toISOString()
    }, { timeout: 3000 });
  } catch (error) {
    console.warn('[BrainIntegration] Failed to log event:', error);
  }
}

export async function queryRouteHistory(contentId: string): Promise<any[]> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.BRAIN_V2}/memory/query`, {
      params: { domain: 'routing', contentId },
      timeout: 3000
    });
    return response.data.events || [];
  } catch (error) {
    console.warn('[BrainIntegration] Failed to query history:', error);
    return [];
  }
}

export async function analyzeRoutePatterns(): Promise<any> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.BRAIN_V2}/memory/analyze`, {
      domain: 'routing',
      analysisType: 'success_patterns'
    }, { timeout: 5000 });
    return response.data.patterns || {};
  } catch (error) {
    console.warn('[BrainIntegration] Failed to analyze patterns:', error);
    return {};
  }
}
