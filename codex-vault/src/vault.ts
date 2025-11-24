// Credential Vault v2 (Iron Vault) - Vault Storage

import { v4 as uuidv4 } from 'uuid';
import { encryptionEngine } from './encryption.js';
import { keyManager } from './keyManager.js';
import type {
  Credential,
  EncryptedCredential,
  StoreCredentialRequest,
  GetCredentialRequest,
  UpdateCredentialRequest,
  DeleteCredentialRequest,
  ListCredentialsRequest,
  VaultScope
} from './types.js';

class Vault {
  private credentials: Map<string, EncryptedCredential> = new Map();

  /**
   * Store a new credential (encrypted)
   */
  store(request: StoreCredentialRequest): { id: string; success: boolean } {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Encrypt credential data
    const dataString = JSON.stringify(request.data);
    const { encrypted, iv, tag, salt } = encryptionEngine.encrypt(dataString);

    const encryptedCredential: EncryptedCredential = {
      id,
      type: request.type,
      scope: request.scope,
      name: request.name,
      username: request.username,
      email: request.email,
      encryptedData: encrypted,
      iv,
      tag,
      salt,
      metadata: request.metadata,
      createdAt: now,
      updatedAt: now,
      expiresAt: request.expiresAt,
      tags: request.tags || []
    };

    this.credentials.set(id, encryptedCredential);

    console.log(`[Vault] Stored credential: ${id} (${request.type}, scope: ${request.scope})`);

    return { id, success: true };
  }

  /**
   * Get a credential (decrypted if authorized)
   */
  get(request: GetCredentialRequest): Credential | null {
    const encrypted = this.credentials.get(request.id);

    if (!encrypted) {
      console.warn(`[Vault] Credential not found: ${request.id}`);
      return null;
    }

    // Check access
    if (!keyManager.hasAccess(request.requestingService, encrypted.scope)) {
      console.warn(
        `[Vault] Access denied: ${request.requestingService} cannot access ${encrypted.scope}`
      );
      return null;
    }

    // Decrypt data
    try {
      const decryptedData = encryptionEngine.decrypt(
        encrypted.encryptedData,
        encrypted.iv,
        encrypted.tag,
        encrypted.salt
      );

      const credential: Credential = {
        id: encrypted.id,
        type: encrypted.type,
        scope: encrypted.scope,
        name: encrypted.name,
        username: encrypted.username,
        email: encrypted.email,
        data: JSON.parse(decryptedData),
        metadata: encrypted.metadata,
        createdAt: encrypted.createdAt,
        updatedAt: encrypted.updatedAt,
        expiresAt: encrypted.expiresAt,
        tags: encrypted.tags
      };

      console.log(`[Vault] Retrieved credential: ${request.id} for ${request.requestingService}`);

      return credential;
    } catch (error) {
      console.error(`[Vault] Decryption failed for ${request.id}:`, error);
      return null;
    }
  }

  /**
   * Update a credential
   */
  update(request: UpdateCredentialRequest): { success: boolean } {
    const existing = this.credentials.get(request.id);

    if (!existing) {
      console.warn(`[Vault] Credential not found for update: ${request.id}`);
      return { success: false };
    }

    const now = new Date().toISOString();

    // If data is being updated, re-encrypt
    let encryptedData = existing.encryptedData;
    let iv = existing.iv;
    let tag = existing.tag;
    let salt = existing.salt;

    if (request.data) {
      const dataString = JSON.stringify(request.data);
      const encrypted = encryptionEngine.encrypt(dataString);
      encryptedData = encrypted.encrypted;
      iv = encrypted.iv;
      tag = encrypted.tag;
      salt = encrypted.salt;
    }

    const updated: EncryptedCredential = {
      ...existing,
      encryptedData,
      iv,
      tag,
      salt,
      metadata: request.metadata !== undefined ? request.metadata : existing.metadata,
      expiresAt: request.expiresAt !== undefined ? request.expiresAt : existing.expiresAt,
      tags: request.tags !== undefined ? request.tags : existing.tags,
      updatedAt: now
    };

    this.credentials.set(request.id, updated);

    console.log(`[Vault] Updated credential: ${request.id}`);

    return { success: true };
  }

  /**
   * Delete a credential
   */
  delete(request: DeleteCredentialRequest): { success: boolean } {
    const deleted = this.credentials.delete(request.id);

    if (deleted) {
      console.log(`[Vault] Deleted credential: ${request.id}`);
    } else {
      console.warn(`[Vault] Credential not found for deletion: ${request.id}`);
    }

    return { success: deleted };
  }

  /**
   * List credentials (filtered by scope and access control)
   */
  list(request: ListCredentialsRequest): Array<Omit<EncryptedCredential, 'encryptedData' | 'iv' | 'tag' | 'salt'>> {
    const accessibleScopes = keyManager.getAccessibleScopes(request.requestingService);

    const filtered = Array.from(this.credentials.values())
      .filter(cred => {
        // Check scope access
        if (!accessibleScopes.includes(cred.scope)) return false;

        // Filter by requested scope
        if (request.scope && cred.scope !== request.scope) return false;

        // Filter by type
        if (request.type && cred.type !== request.type) return false;

        // Filter by tags
        if (request.tags && request.tags.length > 0) {
          const hasTags = request.tags.some(tag => cred.tags?.includes(tag));
          if (!hasTags) return false;
        }

        return true;
      })
      .map(cred => ({
        id: cred.id,
        type: cred.type,
        scope: cred.scope,
        name: cred.name,
        username: cred.username,
        email: cred.email,
        metadata: cred.metadata,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
        expiresAt: cred.expiresAt,
        tags: cred.tags
      }));

    console.log(`[Vault] Listed ${filtered.length} credentials for ${request.requestingService}`);

    return filtered;
  }

  /**
   * Get vault statistics
   */
  getStats(): {
    totalCredentials: number;
    byScope: Record<VaultScope, number>;
    byType: Record<string, number>;
  } {
    const byScope: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const cred of this.credentials.values()) {
      byScope[cred.scope] = (byScope[cred.scope] || 0) + 1;
      byType[cred.type] = (byType[cred.type] || 0) + 1;
    }

    return {
      totalCredentials: this.credentials.size,
      byScope: byScope as Record<VaultScope, number>,
      byType
    };
  }
}

export const vault = new Vault();
