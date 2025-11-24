/**
 * E-Commerce Engine v2 - Store Analytics
 * Tracks and analyzes store performance metrics
 */

import storeDB, { type Store, type Order, type Product } from '../db/storeDB.js';
import { logger } from '../utils/logger.js';

export interface StoreMetrics {
  storeId: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate?: number;
  topProducts?: Array<{ productId: string; name: string; revenue: number; orders: number }>;
  recentOrders?: Order[];
}

export async function getStoreAnalytics(storeId: string): Promise<{ ok: boolean; metrics?: StoreMetrics; error?: string }> {
  try {
    logger.info(`Fetching analytics for store: ${storeId}`);

    const store = storeDB.getStore(storeId);
    if (!store) {
      return { ok: false, error: 'Store not found' };
    }

    const orders = storeDB.listOrders(storeId);
    const products = storeDB.listProducts(storeId);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top products
    const productSales = new Map<string, { revenue: number; orders: number }>();
    
    for (const order of orders) {
      const current = productSales.get(order.product_id) || { revenue: 0, orders: 0 };
      productSales.set(order.product_id, {
        revenue: current.revenue + order.amount,
        orders: current.orders + 1
      });
    }

    const topProducts = Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          name: product?.name || 'Unknown',
          revenue: stats.revenue,
          orders: stats.orders
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const metrics: StoreMetrics = {
      storeId,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topProducts,
      recentOrders: orders.slice(0, 10)
    };

    logger.info(`Analytics retrieved for store: ${storeId}`);

    return { ok: true, metrics };
  } catch (error: any) {
    logger.error('Failed to get analytics', error);
    return { ok: false, error: error.message };
  }
}

export async function recordMetric(storeId: string, metric: string, value: number, metadata?: any): Promise<{ ok: boolean; error?: string }> {
  try {
    storeDB.recordAnalytic({
      store_id: storeId,
      metric,
      value,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    });

    logger.info(`Recorded metric ${metric} for store ${storeId}: ${value}`);

    return { ok: true };
  } catch (error: any) {
    logger.error('Failed to record metric', error);
    return { ok: false, error: error.message };
  }
}

export async function getMetricHistory(storeId: string, metric: string): Promise<{ ok: boolean; history?: any[]; error?: string }> {
  try {
    const analytics = storeDB.getAnalytics(storeId, metric);

    const history = analytics.map(a => ({
      value: a.value,
      timestamp: a.timestamp,
      metadata: a.metadata ? JSON.parse(a.metadata) : {}
    }));

    return { ok: true, history };
  } catch (error: any) {
    logger.error('Failed to get metric history', error);
    return { ok: false, error: error.message };
  }
}

export async function generateReport(storeId: string, period: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<{ ok: boolean; report?: any; error?: string }> {
  try {
    logger.info(`Generating ${period} report for store: ${storeId}`);

    const metricsResult = await getStoreAnalytics(storeId);
    if (!metricsResult.ok || !metricsResult.metrics) {
      return { ok: false, error: 'Failed to get metrics' };
    }

    const store = storeDB.getStore(storeId);
    const products = storeDB.listProducts(storeId);

    const report = {
      period,
      generatedAt: new Date().toISOString(),
      store: {
        id: store?.id,
        name: store?.name,
        status: store?.status
      },
      summary: {
        totalRevenue: metricsResult.metrics.totalRevenue,
        totalOrders: metricsResult.metrics.totalOrders,
        avgOrderValue: metricsResult.metrics.avgOrderValue,
        totalProducts: products.length
      },
      topProducts: metricsResult.metrics.topProducts,
      recommendations: generateRecommendations(metricsResult.metrics)
    };

    logger.info(`Report generated for store: ${storeId}`);

    return { ok: true, report };
  } catch (error: any) {
    logger.error('Failed to generate report', error);
    return { ok: false, error: error.message };
  }
}

function generateRecommendations(metrics: StoreMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.totalOrders === 0) {
    recommendations.push('No orders yet - focus on marketing and traffic generation');
    recommendations.push('Consider offering a launch discount');
  } else if (metrics.totalOrders < 10) {
    recommendations.push('Increase marketing efforts to drive more traffic');
    recommendations.push('Optimize product descriptions and images');
  }

  if (metrics.avgOrderValue < 30) {
    recommendations.push('Consider bundling products to increase average order value');
    recommendations.push('Add upsell/cross-sell opportunities');
  }

  if (metrics.topProducts && metrics.topProducts.length > 0) {
    const topProduct = metrics.topProducts[0];
    recommendations.push(`Focus marketing on top seller: ${topProduct.name}`);
  }

  recommendations.push('Collect customer feedback to improve products');
  recommendations.push('Test different price points');

  return recommendations;
}
