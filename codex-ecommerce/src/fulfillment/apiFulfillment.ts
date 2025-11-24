/**
 * E-Commerce Engine v2 - API Fulfillment
 * Webhook-based fulfillment system for external integrations
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';
import type { Order } from '../db/storeDB.js';

export interface WebhookConfig {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
}

export async function sendOrderToWebhook(order: Order, config: WebhookConfig): Promise<{ ok: boolean; response?: any; error?: string }> {
  try {
    logger.info(`Sending order ${order.id} to webhook: ${config.url}`);

    const payload = {
      orderId: order.id,
      storeId: order.store_id,
      productId: order.product_id,
      customerEmail: order.customer_email,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      timestamp: new Date().toISOString(),
      metadata: order.metadata ? JSON.parse(order.metadata) : {}
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    // Add authentication headers
    if (config.auth) {
      if (config.auth.type === 'bearer' && config.auth.token) {
        headers['Authorization'] = `Bearer ${config.auth.token}`;
      } else if (config.auth.type === 'api-key' && config.auth.apiKey) {
        const headerName = config.auth.apiKeyHeader || 'X-API-Key';
        headers[headerName] = config.auth.apiKey;
      } else if (config.auth.type === 'basic' && config.auth.username && config.auth.password) {
        const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
    }

    const response = await axios({
      method: config.method || 'POST',
      url: config.url,
      headers,
      data: payload,
      timeout: 10000
    });

    logger.info(`Webhook request successful for order: ${order.id}`);

    return { ok: true, response: response.data };
  } catch (error: any) {
    logger.error('Webhook request failed', error);
    return { ok: false, error: error.message };
  }
}

export async function testWebhook(config: WebhookConfig): Promise<{ ok: boolean; response?: any; error?: string }> {
  try {
    logger.info(`Testing webhook: ${config.url}`);

    const testPayload = {
      test: true,
      message: 'Webhook test from Codex E-Commerce Engine',
      timestamp: new Date().toISOString()
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (config.auth?.type === 'bearer' && config.auth.token) {
      headers['Authorization'] = `Bearer ${config.auth.token}`;
    }

    const response = await axios({
      method: config.method || 'POST',
      url: config.url,
      headers,
      data: testPayload,
      timeout: 5000
    });

    logger.info('Webhook test successful');

    return { ok: true, response: response.data };
  } catch (error: any) {
    logger.error('Webhook test failed', error);
    return { ok: false, error: error.message };
  }
}

export async function retryFailedOrder(order: Order, config: WebhookConfig, maxRetries: number = 3): Promise<{ ok: boolean; error?: string }> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.info(`Retry attempt ${attempt}/${maxRetries} for order: ${order.id}`);

    const result = await sendOrderToWebhook(order, config);
    
    if (result.ok) {
      logger.info(`Order ${order.id} successfully sent on attempt ${attempt}`);
      return { ok: true };
    }

    lastError = result.error || 'Unknown error';
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  logger.error(`All retry attempts failed for order: ${order.id}`);
  return { ok: false, error: `Failed after ${maxRetries} attempts. Last error: ${lastError}` };
}
