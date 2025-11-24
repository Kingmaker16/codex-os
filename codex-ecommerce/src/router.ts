/**
 * E-Commerce Engine v2 - Main Router
 * Defines all REST API endpoints for e-commerce functionality
 */

import type { FastifyInstance } from 'fastify';
import { buildNextStore, generateStorePage } from './storeBuilder/nextBuilder.js';
import { deployStore, getStoreStatus } from './storeBuilder/deployManager.js';
import { aggregateResearch } from './productResearch/aggregator.js';
import { scanCompetitor } from './productResearch/competitorScanner.js';
import { generateProductCopy } from './productGenerator/copyGenerator.js';
import { generateProductImages } from './productGenerator/aiImageGenerator.js';
import { generateUGCTemplates } from './productGenerator/ugcTemplateEngine.js';
import { testEmailConfig } from './fulfillment/emailFulfillment.js';
import { testWebhook } from './fulfillment/apiFulfillment.js';
import { getStoreAnalytics, generateReport } from './analytics/storeAnalytics.js';
import { syncToMonetization } from './analytics/monetizationSync.js';
import storeDB from './db/storeDB.js';
import { generateId } from './utils/validator.js';
import { logger } from './utils/logger.js';

export async function registerRoutes(app: FastifyInstance) {
  // Health check
  app.get('/health', async () => {
    return {
      ok: true,
      service: 'codex-ecommerce',
      version: '2.0.0',
      features: [
        'store-builder',
        'product-research',
        'ai-content-generation',
        'fulfillment',
        'analytics',
        'monetization-sync'
      ]
    };
  });

  // Store Builder Endpoints
  app.post('/builder/createStore', async (request, reply) => {
    try {
      const { name, theme, domain } = request.body as any;

      if (!name) {
        return reply.code(400).send({ error: 'Store name is required' });
      }

      const storeId = generateId('store');
      
      // Create store in database
      storeDB.createStore({
        id: storeId,
        name,
        theme: theme || 'modern',
        domain: domain || undefined,
        status: 'draft'
      });

      // Build Next.js storefront
      const buildResult = await buildNextStore({
        store: storeDB.getStore(storeId)!,
        products: []
      });

      if (!buildResult.ok) {
        return reply.code(500).send({ error: buildResult.error });
      }

      logger.info(`Store created: ${storeId}`);

      return {
        success: true,
        store: {
          id: storeId,
          name,
          path: buildResult.path,
          status: 'draft'
        }
      };
    } catch (error: any) {
      logger.error('Create store failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/builder/addProduct', async (request, reply) => {
    try {
      const { storeId, name, description, price, currency, images, category } = request.body as any;

      if (!storeId || !name || !price) {
        return reply.code(400).send({ error: 'storeId, name, and price are required' });
      }

      const store = storeDB.getStore(storeId);
      if (!store) {
        return reply.code(404).send({ error: 'Store not found' });
      }

      const productId = generateId('product');

      storeDB.createProduct({
        id: productId,
        store_id: storeId,
        name,
        description: description || '',
        price,
        currency: currency || 'USD',
        images: images ? JSON.stringify(images) : undefined,
        category: category || 'general'
      });

      // Rebuild store with new product
      const products = storeDB.listProducts(storeId);
      await buildNextStore({ store, products });

      logger.info(`Product added to store ${storeId}: ${productId}`);

      return {
        success: true,
        product: {
          id: productId,
          storeId,
          name,
          price
        }
      };
    } catch (error: any) {
      logger.error('Add product failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/builder/generatePage', async (request, reply) => {
    try {
      const { storeId, pageType, pageData } = request.body as any;

      if (!storeId || !pageType) {
        return reply.code(400).send({ error: 'storeId and pageType are required' });
      }

      const result = await generateStorePage(storeId, pageType, pageData);

      return result;
    } catch (error: any) {
      logger.error('Generate page failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/builder/deploy', async (request, reply) => {
    try {
      const { storeId, type, port } = request.body as any;

      if (!storeId || !type) {
        return reply.code(400).send({ error: 'storeId and type are required' });
      }

      const result = await deployStore({ storeId, type, port });

      return result;
    } catch (error: any) {
      logger.error('Deploy failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Product Research Endpoints
  app.post('/research/findProducts', async (request, reply) => {
    try {
      const researchRequest = request.body as any;

      if (!researchRequest.query) {
        return reply.code(400).send({ error: 'query is required' });
      }

      const result = await aggregateResearch(researchRequest);

      return result;
    } catch (error: any) {
      logger.error('Product research failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/research/competitors', async (request, reply) => {
    try {
      const { url } = request.body as any;

      if (!url) {
        return reply.code(400).send({ error: 'url is required' });
      }

      const result = await scanCompetitor(url);

      return result;
    } catch (error: any) {
      logger.error('Competitor scan failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Media Generation Endpoints
  app.post('/media/productImages', async (request, reply) => {
    try {
      const imageRequest = request.body as any;

      if (!imageRequest.productName) {
        return reply.code(400).send({ error: 'productName is required' });
      }

      const result = await generateProductImages(imageRequest);

      return result;
    } catch (error: any) {
      logger.error('Image generation failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/media/ugcTemplates', async (request, reply) => {
    try {
      const { productName, platform } = request.body as any;

      if (!productName) {
        return reply.code(400).send({ error: 'productName is required' });
      }

      const result = await generateUGCTemplates(productName, platform);

      return result;
    } catch (error: any) {
      logger.error('UGC template generation failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.post('/media/productCopy', async (request, reply) => {
    try {
      const copyRequest = request.body as any;

      if (!copyRequest.productName) {
        return reply.code(400).send({ error: 'productName is required' });
      }

      const result = await generateProductCopy(copyRequest);

      return result;
    } catch (error: any) {
      logger.error('Copy generation failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Fulfillment Endpoints
  app.post('/fulfillment/test', async (request, reply) => {
    try {
      const { type, config } = request.body as any;

      if (!type || !config) {
        return reply.code(400).send({ error: 'type and config are required' });
      }

      let result;
      if (type === 'email') {
        result = await testEmailConfig(config);
      } else if (type === 'webhook') {
        result = await testWebhook(config);
      } else {
        return reply.code(400).send({ error: 'Invalid type. Use "email" or "webhook"' });
      }

      return result;
    } catch (error: any) {
      logger.error('Fulfillment test failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // Analytics Endpoints
  app.post('/analytics/sync', async (request, reply) => {
    try {
      const { storeId } = request.body as any;

      if (!storeId) {
        return reply.code(400).send({ error: 'storeId is required' });
      }

      const result = await syncToMonetization(storeId);

      return result;
    } catch (error: any) {
      logger.error('Analytics sync failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.get('/analytics/store/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      if (!id) {
        return reply.code(400).send({ error: 'Store ID is required' });
      }

      const result = await getStoreAnalytics(id);

      return result;
    } catch (error: any) {
      logger.error('Get analytics failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  app.get('/analytics/report/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { period } = request.query as any;

      if (!id) {
        return reply.code(400).send({ error: 'Store ID is required' });
      }

      const result = await generateReport(id, period || 'all');

      return result;
    } catch (error: any) {
      logger.error('Generate report failed', error);
      return reply.code(500).send({ error: error.message });
    }
  });

  logger.info('E-Commerce routes registered');
}
