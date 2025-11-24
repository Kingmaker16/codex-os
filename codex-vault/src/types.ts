// Credential Vault v2 (Iron Vault) - Type Definitions

export type VaultScope = 'SOCIAL' | 'ECOMM' | 'VIDEO' | 'AUTONOMY' | 'DOMAIN' | 'CLOUD';

export type CredentialType = 
  | 'tiktok_login'
  | 'instagram_login'
  | 'youtube_login'
  | 'twitter_login'
  | 'gmail_app_password'
  | 'domain_registrar'
  | 'aws_key'
  | 'gcp_key'
  | 'azure_key'
  | 'api_token'
  | 'oauth_token'
  | 'generic';

export interface Credential {
  id: string;
  type: CredentialType;
  scope: VaultScope;
  name: string;
  username?: string;
  email?: string;
  data: Record<string, any>; // Encrypted credential data
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  tags?: string[];
}

export interface EncryptedCredential extends Omit<Credential, 'data'> {
  encryptedData: string;
  iv: string;
  tag: string;
  salt: string;
}

export interface StoreCredentialRequest {
  type: CredentialType;
  scope: VaultScope;
  name: string;
  username?: string;
  email?: string;
  data: Record<string, any>; // Raw credential data (will be encrypted)
  metadata?: Record<string, any>;
  expiresAt?: string;
  tags?: string[];
}

export interface GetCredentialRequest {
  id: string;
  requestingService: string;
}

export interface UpdateCredentialRequest {
  id: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  expiresAt?: string;
  tags?: string[];
}

export interface DeleteCredentialRequest {
  id: string;
}

export interface ListCredentialsRequest {
  scope?: VaultScope;
  type?: CredentialType;
  requestingService: string;
  tags?: string[];
}

export interface AuthorizeRequest {
  service: string;
  scope: VaultScope;
}

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}
