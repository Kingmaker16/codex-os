// Credential Vault v2 (Iron Vault) - Configuration

export const CONFIG = {
  SERVICE_NAME: 'codex-vault',
  VERSION: '2.0.0',
  MODE: 'iron',
  PORT: parseInt(process.env.PORT || '5175', 10),

  // Encryption settings
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32, // 256 bits
    IV_LENGTH: 16,  // 128 bits
    TAG_LENGTH: 16, // 128 bits
    SALT_LENGTH: 32,
    PBKDF2_ITERATIONS: 100000,
    PBKDF2_DIGEST: 'sha256'
  },

  // Vault scopes
  SCOPES: {
    SOCIAL: 'SOCIAL',        // TikTok, Instagram, Twitter, etc.
    ECOMM: 'ECOMM',          // Shopify, Stripe, payment gateways
    VIDEO: 'VIDEO',          // YouTube, Vimeo
    AUTONOMY: 'AUTONOMY',    // Internal system credentials
    DOMAIN: 'DOMAIN',        // Domain registrar accounts
    CLOUD: 'CLOUD'           // AWS, GCP, Azure keys
  },

  // Service access control rules
  ACCESS_RULES: {
    'codex-hands-v5': ['SOCIAL', 'DOMAIN'],
    'codex-social': ['SOCIAL'],
    'codex-ecom': ['ECOMM'],
    'codex-orchestrator': ['SOCIAL', 'ECOMM', 'VIDEO', 'AUTONOMY', 'DOMAIN', 'CLOUD'],
    'codex-video': ['VIDEO'],
    'codex-vault': ['SOCIAL', 'ECOMM', 'VIDEO', 'AUTONOMY', 'DOMAIN', 'CLOUD'] // Full access
  },

  // Master encryption key (in production, load from secure env var or key management service)
  MASTER_KEY: process.env.VAULT_MASTER_KEY || 'codex-vault-master-key-change-in-production'
};
