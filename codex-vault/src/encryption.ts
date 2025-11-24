// Credential Vault v2 (Iron Vault) - Encryption Engine

import crypto from 'crypto';
import { CONFIG } from './config.js';
import type { EncryptionResult } from './types.js';

export class EncryptionEngine {
  /**
   * Derive encryption key from master key using PBKDF2
   */
  private deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      CONFIG.MASTER_KEY,
      salt,
      CONFIG.ENCRYPTION.PBKDF2_ITERATIONS,
      CONFIG.ENCRYPTION.KEY_LENGTH,
      CONFIG.ENCRYPTION.PBKDF2_DIGEST
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(plaintext: string): EncryptionResult {
    // Generate random salt and IV
    const salt = crypto.randomBytes(CONFIG.ENCRYPTION.SALT_LENGTH);
    const iv = crypto.randomBytes(CONFIG.ENCRYPTION.IV_LENGTH);

    // Derive key from master key + salt
    const key = this.deriveKey(salt);

    // Create cipher
    const cipher = crypto.createCipheriv(
      CONFIG.ENCRYPTION.ALGORITHM,
      key,
      iv
    ) as any;

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encrypted: string, iv: string, tag: string, salt: string): string {
    // Convert hex strings back to buffers
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    const saltBuffer = Buffer.from(salt, 'hex');

    // Derive key from master key and salt
    const key = this.deriveKey(saltBuffer);

    // Create decipher
    const decipher = crypto.createDecipheriv(
      CONFIG.ENCRYPTION.ALGORITHM,
      key,
      ivBuffer
    ) as any;

    // Set authentication tag
    decipher.setAuthTag(tagBuffer);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash data (for indexing without exposing plaintext)
   */
  hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

export const encryptionEngine = new EncryptionEngine();
