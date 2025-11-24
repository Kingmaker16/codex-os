/**
 * E-Commerce Engine v2 - Deploy Manager
 * Handles local and Vercel-compatible deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

export interface DeployOptions {
  storeId: string;
  type: 'local' | 'vercel';
  port?: number;
}

export interface DeployResult {
  ok: boolean;
  url?: string;
  error?: string;
  message?: string;
}

export async function deployStore(options: DeployOptions): Promise<DeployResult> {
  try {
    const { storeId, type, port = 3010 } = options;
    const storePath = join(process.cwd(), 'generated-stores', storeId);

    if (!existsSync(storePath)) {
      return { ok: false, error: 'Store directory not found' };
    }

    if (type === 'local') {
      return await deployLocal(storePath, port);
    } else if (type === 'vercel') {
      return await prepareVercelDeploy(storePath);
    }

    return { ok: false, error: 'Invalid deployment type' };
  } catch (error: any) {
    logger.error('Deployment failed', error);
    return { ok: false, error: error.message };
  }
}

async function deployLocal(storePath: string, port: number): Promise<DeployResult> {
  try {
    logger.info(`Starting local deployment at ${storePath}`);

    // Check if dependencies are installed
    const nodeModulesExists = existsSync(join(storePath, 'node_modules'));
    
    if (!nodeModulesExists) {
      logger.info('Installing dependencies...');
      await execAsync('npm install', { cwd: storePath });
    }

    // Build the Next.js app
    logger.info('Building Next.js application...');
    await execAsync('npm run build', { cwd: storePath });

    // Start the server (non-blocking)
    logger.info(`Starting server on port ${port}...`);
    const startCommand = `npm start`;
    
    // Note: This starts the server but doesn't wait for it
    exec(startCommand, { cwd: storePath }, (error) => {
      if (error) {
        logger.error('Server start error', error);
      }
    });

    const url = `http://localhost:${port}`;
    logger.info(`Store deployed locally at ${url}`);

    return {
      ok: true,
      url,
      message: 'Store is building and will be available shortly'
    };
  } catch (error: any) {
    logger.error('Local deployment failed', error);
    return { ok: false, error: error.message };
  }
}

async function prepareVercelDeploy(storePath: string): Promise<DeployResult> {
  try {
    logger.info(`Preparing Vercel deployment for ${storePath}`);

    // Create vercel.json configuration
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next'
        }
      ],
      routes: [
        {
          src: '/(.*)',
          dest: '/$1'
        }
      ]
    };

    const vercelConfigPath = join(storePath, 'vercel.json');
    const fs = await import('fs');
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

    logger.info('Vercel configuration created');

    return {
      ok: true,
      message: 'Store is ready for Vercel deployment. Run `vercel deploy` in the store directory.',
      url: storePath
    };
  } catch (error: any) {
    logger.error('Vercel preparation failed', error);
    return { ok: false, error: error.message };
  }
}

export async function getStoreStatus(storeId: string): Promise<{ ok: boolean; status?: string; url?: string; error?: string }> {
  try {
    const storePath = join(process.cwd(), 'generated-stores', storeId);

    if (!existsSync(storePath)) {
      return { ok: false, error: 'Store not found' };
    }

    const buildExists = existsSync(join(storePath, '.next'));
    const nodeModulesExists = existsSync(join(storePath, 'node_modules'));

    let status = 'not-built';
    if (buildExists && nodeModulesExists) {
      status = 'ready';
    } else if (nodeModulesExists) {
      status = 'needs-build';
    }

    return {
      ok: true,
      status,
      url: status === 'ready' ? 'http://localhost:3010' : undefined
    };
  } catch (error: any) {
    logger.error('Failed to get store status', error);
    return { ok: false, error: error.message };
  }
}
