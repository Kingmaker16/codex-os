// Credential Vault v2 (Iron Vault) - Key Manager

import { CONFIG } from './config.js';
import type { VaultScope } from './types.js';

export class KeyManager {
  /**
   * Check if a service has access to a specific scope
   */
  hasAccess(service: string, scope: VaultScope): boolean {
    const allowedScopes = CONFIG.ACCESS_RULES[service as keyof typeof CONFIG.ACCESS_RULES];
    
    if (!allowedScopes) {
      console.warn(`[KeyManager] Unknown service: ${service}`);
      return false;
    }

    return allowedScopes.includes(scope);
  }

  /**
   * Get all scopes accessible by a service
   */
  getAccessibleScopes(service: string): VaultScope[] {
    return (CONFIG.ACCESS_RULES[service as keyof typeof CONFIG.ACCESS_RULES] || []) as VaultScope[];
  }

  /**
   * Check if a service can write (only vault itself can write)
   */
  canWrite(service: string): boolean {
    return service === 'codex-vault';
  }

  /**
   * Validate service name
   */
  isValidService(service: string): boolean {
    return service in CONFIG.ACCESS_RULES;
  }

  /**
   * Get access summary for a service
   */
  getAccessSummary(service: string): {
    service: string;
    canRead: VaultScope[];
    canWrite: boolean;
  } {
    return {
      service,
      canRead: this.getAccessibleScopes(service),
      canWrite: this.canWrite(service)
    };
  }
}

export const keyManager = new KeyManager();
