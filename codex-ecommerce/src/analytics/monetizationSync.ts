/**
 * E-Commerce Engine v2 - Monetization Sync
 * Syncs e-commerce revenue data with Monetization Engine
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';
import storeDB from '../db/storeDB.js';

const MONETIZATION_URL = process.env.MONETIZATION_URL || 'http://localhost:4850';

export interface MonetizationData {
  revenue: number;
  costs: number;
  orders: number;
  source: string;
  period: string;
}

export async function syncToMonetization(storeId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    logger.info(`Syncing store ${storeId} data to Monetization Engine`);

    const orders = storeDB.listOrders(storeId);
    const store = storeDB.getStore(storeId);

    if (!store) {
      return { ok: false, error: 'Store not found' };
    }

    // Calculate revenue and costs
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const costs = revenue * 0.3; // Assume 30% cost of goods sold

    const payload: MonetizationData = {
      revenue,
      costs,
      orders: orders.length,
      source: `ecommerce-${storeId}`,
      period: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    const response = await axios.post(`${MONETIZATION_URL}/monetization/ecomm/sync`, payload);

    logger.info(`Monetization sync successful for store: ${storeId}`);

    // Record the sync event
    storeDB.recordAnalytic({
      store_id: storeId,
      metric: 'monetization_sync',
      value: revenue,
      metadata: JSON.stringify({ orders: orders.length, timestamp: new Date().toISOString() })
    });

    return { ok: true };
  } catch (error: any) {
    logger.error('Monetization sync failed', error);
    return { ok: false, error: error.message };
  }
}

export async function batchSyncAllStores(): Promise<{ ok: boolean; synced?: number; failed?: number; error?: string }> {
  try {
    logger.info('Starting batch sync for all stores');

    const stores = storeDB.listStores();
    let synced = 0;
    let failed = 0;

    for (const store of stores) {
      const result = await syncToMonetization(store.id);
      if (result.ok) {
        synced++;
      } else {
        failed++;
      }
    }

    logger.info(`Batch sync complete: ${synced} synced, ${failed} failed`);

    return { ok: true, synced, failed };
  } catch (error: any) {
    logger.error('Batch sync failed', error);
    return { ok: false, error: error.message };
  }
}

export async function scheduleAutoSync(intervalMinutes: number = 60): Promise<{ ok: boolean; error?: string }> {
  try {
    logger.info(`Scheduling auto-sync every ${intervalMinutes} minutes`);

    // Note: In production, this would use a job scheduler like node-cron
    setInterval(async () => {
      logger.info('Running scheduled sync...');
      await batchSyncAllStores();
    }, intervalMinutes * 60 * 1000);

    return { ok: true };
  } catch (error: any) {
    logger.error('Failed to schedule auto-sync', error);
    return { ok: false, error: error.message };
  }
}
