// Content Routing Engine v2 ULTRA - Ops Integration

import axios from 'axios';
import { CONFIG } from '../config.js';

export async function logMetric(metric: string, value: number, tags?: Record<string, string>): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.OPS}/ops/metrics`, {
      service: CONFIG.SERVICE_NAME,
      metric,
      value,
      tags,
      timestamp: new Date().toISOString()
    }, { timeout: 2000 });
  } catch (error) {
    console.warn('[OpsIntegration] Failed to log metric:', error);
  }
}

export async function logOperation(operation: string, status: string, metadata?: any): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.OPS}/ops/operations`, {
      service: CONFIG.SERVICE_NAME,
      operation,
      status,
      metadata,
      timestamp: new Date().toISOString()
    }, { timeout: 2000 });
  } catch (error) {
    console.warn('[OpsIntegration] Failed to log operation:', error);
  }
}

export async function getServiceMetrics(): Promise<any> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.OPS}/ops/metrics/${CONFIG.SERVICE_NAME}`, {
      timeout: 3000
    });
    return response.data.metrics || {};
  } catch (error) {
    console.warn('[OpsIntegration] Failed to get metrics:', error);
    return {};
  }
}
