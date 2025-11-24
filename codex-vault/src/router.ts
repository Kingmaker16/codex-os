// Credential Vault v2 (Iron Vault) - API Router

import type { FastifyInstance } from 'fastify';
import { vault } from './vault.js';
import { keyManager } from './keyManager.js';
import { CONFIG } from './config.js';
import type {
  StoreCredentialRequest,
  GetCredentialRequest,
  UpdateCredentialRequest,
  DeleteCredentialRequest,
  ListCredentialsRequest,
  AuthorizeRequest
} from './types.js';

export function registerRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => {
    return {
      ok: true,
      service: CONFIG.SERVICE_NAME,
      version: CONFIG.VERSION,
      mode: CONFIG.MODE
    };
  });

  // Store credential (only vault can write)
  fastify.post<{ Body: StoreCredentialRequest }>('/vault/store', async (request, reply) => {
    const result = vault.store(request.body);
    return result;
  });

  // Get credential
  fastify.post<{ Body: GetCredentialRequest }>('/vault/get', async (request, reply) => {
    const credential = vault.get(request.body);

    if (!credential) {
      return reply.status(404).send({ error: 'Credential not found or access denied' });
    }

    return credential;
  });

  // Update credential (only vault can write)
  fastify.post<{ Body: UpdateCredentialRequest }>('/vault/update', async (request, reply) => {
    const result = vault.update(request.body);

    if (!result.success) {
      return reply.status(404).send({ error: 'Credential not found' });
    }

    return result;
  });

  // Delete credential (only vault can write)
  fastify.post<{ Body: DeleteCredentialRequest }>('/vault/delete', async (request, reply) => {
    const result = vault.delete(request.body);

    if (!result.success) {
      return reply.status(404).send({ error: 'Credential not found' });
    }

    return result;
  });

  // List credentials
  fastify.post<{ Body: ListCredentialsRequest }>('/vault/list', async (request, reply) => {
    const credentials = vault.list(request.body);
    return {
      count: credentials.length,
      credentials
    };
  });

  // Check authorization
  fastify.post<{ Body: AuthorizeRequest }>('/vault/authorize', async (request, reply) => {
    const { service, scope } = request.body;

    const hasAccess = keyManager.hasAccess(service, scope);

    return {
      service,
      scope,
      authorized: hasAccess,
      accessSummary: keyManager.getAccessSummary(service)
    };
  });

  // Get vault stats (admin only)
  fastify.get('/vault/stats', async () => {
    return vault.getStats();
  });

  // Get access rules
  fastify.get('/vault/access-rules', async () => {
    return {
      rules: CONFIG.ACCESS_RULES,
      scopes: Object.keys(CONFIG.SCOPES)
    };
  });
}
