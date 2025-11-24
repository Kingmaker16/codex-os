// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Credential Vault (AES-256 Encryption)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import crypto from "crypto";
import { VAULT_KEY } from "../config.js";
import type { Credential, Platform } from "../types.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// In-memory credential store (in production, use database)
const credentialStore = new Map<string, string>();

/**
 * Derive encryption key from vault key and salt
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(VAULT_KEY, salt, 100000, KEY_LENGTH, "sha512");
}

/**
 * Encrypt credential data using AES-256-GCM
 */
export function encryptCredential(data: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const tag = cipher.getAuthTag();
  
  // Format: salt:iv:tag:encrypted
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted,
  ].join(":");
}

/**
 * Decrypt credential data using AES-256-GCM
 */
export function decryptCredential(encryptedData: string): string {
  const parts = encryptedData.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted data format");
  }
  
  const salt = Buffer.from(parts[0], "hex");
  const iv = Buffer.from(parts[1], "hex");
  const tag = Buffer.from(parts[2], "hex");
  const encrypted = parts[3];
  
  const key = deriveKey(salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Store credential securely
 */
export async function storeCredential(
  platform: Platform,
  accountId: string,
  credential: Credential
): Promise<void> {
  const key = `${platform}:${accountId}`;
  const data = JSON.stringify(credential);
  const encrypted = encryptCredential(data);
  
  credentialStore.set(key, encrypted);
}

/**
 * Retrieve credential securely
 */
export async function getCredential(
  platform: Platform,
  accountId: string
): Promise<Credential | null> {
  const key = `${platform}:${accountId}`;
  const encrypted = credentialStore.get(key);
  
  if (!encrypted) {
    return null;
  }
  
  try {
    const data = decryptCredential(encrypted);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to decrypt credential for ${key}:`, error);
    return null;
  }
}

/**
 * Delete credential
 */
export async function deleteCredential(
  platform: Platform,
  accountId: string
): Promise<boolean> {
  const key = `${platform}:${accountId}`;
  return credentialStore.delete(key);
}

/**
 * List all stored credentials (metadata only, no sensitive data)
 */
export async function listCredentials(): Promise<
  Array<{ platform: Platform; accountId: string }>
> {
  const credentials: Array<{ platform: Platform; accountId: string }> = [];
  
  for (const key of credentialStore.keys()) {
    const [platform, accountId] = key.split(":");
    credentials.push({ platform: platform as Platform, accountId });
  }
  
  return credentials;
}
