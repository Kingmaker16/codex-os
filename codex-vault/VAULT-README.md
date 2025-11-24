# Credential Vault v2 (Iron Vault)

🔐 **Secure credential management with AES-256-GCM encryption and PBKDF2 key derivation**

---

## Overview

Iron Vault is a secure credential storage system for the Codex OS ecosystem. It stores sensitive credentials (social media logins, API keys, cloud credentials) with military-grade encryption and fine-grained access control.

**Security Features:**
- **AES-256-GCM** encryption for all credential data
- **PBKDF2** key derivation (100,000 iterations)
- **Per-credential salts** for additional security
- **Authentication tags** for integrity verification
- **Service-based access control** (read-only for most services)
- **Scope-based isolation** (SOCIAL, ECOMM, VIDEO, etc.)

---

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start service
npm start
# Service runs on http://localhost:5175
```

---

## Architecture

### Vault Scopes

Credentials are organized into 6 scopes:

1. **SOCIAL** - TikTok, Instagram, Twitter logins
2. **ECOMM** - Shopify, Stripe, payment gateways
3. **VIDEO** - YouTube, Vimeo credentials
4. **AUTONOMY** - Internal system credentials
5. **DOMAIN** - Domain registrar accounts
6. **CLOUD** - AWS, GCP, Azure keys

### Credential Types

Supported credential types:
- `tiktok_login`
- `instagram_login`
- `youtube_login`
- `twitter_login`
- `gmail_app_password`
- `domain_registrar`
- `aws_key`
- `gcp_key`
- `azure_key`
- `api_token`
- `oauth_token`
- `generic`

### Access Control Rules

Service-based access control enforced at the engine level:

| Service | Readable Scopes | Can Write? |
|---------|----------------|------------|
| codex-hands-v5 | SOCIAL, DOMAIN | ❌ No |
| codex-social | SOCIAL | ❌ No |
| codex-ecom | ECOMM | ❌ No |
| codex-video | VIDEO | ❌ No |
| codex-orchestrator | ALL | ❌ No |
| codex-vault | ALL | ✅ Yes |

**Write operations** are restricted to the vault service itself. All other services have read-only access to their authorized scopes.

---

## API Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-vault",
  "version": "2.0.0",
  "mode": "iron"
}
```

---

### 2. Store Credential
```bash
POST /vault/store
```

**Request:**
```json
{
  "type": "tiktok_login",
  "scope": "SOCIAL",
  "name": "Main TikTok Account",
  "username": "myuser",
  "email": "user@example.com",
  "data": {
    "password": "secret123",
    "sessionToken": "abc123xyz"
  },
  "metadata": {
    "accountId": "123456"
  },
  "tags": ["primary", "active"]
}
```

**Response:**
```json
{
  "id": "uuid-123",
  "success": true
}
```

**Note:** The `data` field is encrypted using AES-256-GCM before storage.

---

### 3. Get Credential
```bash
POST /vault/get
```

**Request:**
```json
{
  "id": "uuid-123",
  "requestingService": "codex-hands-v5"
}
```

**Response:**
```json
{
  "id": "uuid-123",
  "type": "tiktok_login",
  "scope": "SOCIAL",
  "name": "Main TikTok Account",
  "username": "myuser",
  "email": "user@example.com",
  "data": {
    "password": "secret123",
    "sessionToken": "abc123xyz"
  },
  "metadata": {
    "accountId": "123456"
  },
  "createdAt": "2025-11-22T12:00:00.000Z",
  "updatedAt": "2025-11-22T12:00:00.000Z",
  "tags": ["primary", "active"]
}
```

**Note:** Returns 404 if credential not found or service lacks access to the scope.

---

### 4. Update Credential
```bash
POST /vault/update
```

**Request:**
```json
{
  "id": "uuid-123",
  "data": {
    "password": "newpassword456",
    "sessionToken": "xyz789abc"
  },
  "tags": ["primary", "active", "updated"]
}
```

**Response:**
```json
{
  "success": true
}
```

**Note:** Only specified fields are updated. Omitted fields remain unchanged.

---

### 5. Delete Credential
```bash
POST /vault/delete
```

**Request:**
```json
{
  "id": "uuid-123"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 6. List Credentials
```bash
POST /vault/list
```

**Request:**
```json
{
  "requestingService": "codex-hands-v5",
  "scope": "SOCIAL",
  "tags": ["active"]
}
```

**Response:**
```json
{
  "count": 2,
  "credentials": [
    {
      "id": "uuid-123",
      "type": "tiktok_login",
      "scope": "SOCIAL",
      "name": "Main TikTok Account",
      "username": "myuser",
      "email": "user@example.com",
      "metadata": { "accountId": "123456" },
      "createdAt": "2025-11-22T12:00:00.000Z",
      "updatedAt": "2025-11-22T12:00:00.000Z",
      "tags": ["primary", "active"]
    }
  ]
}
```

**Note:** Returns only credentials accessible to the requesting service. Encrypted data is NOT returned in list operations.

---

### 7. Check Authorization
```bash
POST /vault/authorize
```

**Request:**
```json
{
  "service": "codex-hands-v5",
  "scope": "SOCIAL"
}
```

**Response:**
```json
{
  "service": "codex-hands-v5",
  "scope": "SOCIAL",
  "authorized": true,
  "accessSummary": {
    "service": "codex-hands-v5",
    "canRead": ["SOCIAL", "DOMAIN"],
    "canWrite": false
  }
}
```

---

### 8. Get Vault Stats
```bash
GET /vault/stats
```

**Response:**
```json
{
  "totalCredentials": 15,
  "byScope": {
    "SOCIAL": 8,
    "ECOMM": 3,
    "CLOUD": 4
  },
  "byType": {
    "tiktok_login": 3,
    "instagram_login": 2,
    "aws_key": 2,
    "api_token": 5
  }
}
```

---

### 9. Get Access Rules
```bash
GET /vault/access-rules
```

**Response:**
```json
{
  "rules": {
    "codex-hands-v5": ["SOCIAL", "DOMAIN"],
    "codex-social": ["SOCIAL"],
    "codex-orchestrator": ["SOCIAL", "ECOMM", "VIDEO", "AUTONOMY", "DOMAIN", "CLOUD"]
  },
  "scopes": ["SOCIAL", "ECOMM", "VIDEO", "AUTONOMY", "DOMAIN", "CLOUD"]
}
```

---

## Encryption Details

### Algorithm: AES-256-GCM

- **Cipher**: AES (Advanced Encryption Standard)
- **Key Size**: 256 bits
- **Mode**: GCM (Galois/Counter Mode)
- **Authentication**: Built-in authentication tag (128 bits)

### Key Derivation: PBKDF2

- **Input**: Master key + unique salt per credential
- **Iterations**: 100,000
- **Hash Function**: SHA-256
- **Output**: 256-bit encryption key

### Storage Format

Each credential is stored with:
- `encryptedData` - AES-256-GCM encrypted JSON
- `iv` - Initialization vector (128 bits, unique per credential)
- `tag` - Authentication tag (128 bits, for integrity verification)
- `salt` - Salt for PBKDF2 (256 bits, unique per credential)

**Example encrypted storage:**
```json
{
  "id": "uuid-123",
  "type": "tiktok_login",
  "scope": "SOCIAL",
  "encryptedData": "a7f8e9d2c1b0...",
  "iv": "1a2b3c4d5e6f...",
  "tag": "9f8e7d6c5b4a...",
  "salt": "f1e2d3c4b5a6..."
}
```

---

## Security Best Practices

### In Production

1. **Change Master Key**: Set `VAULT_MASTER_KEY` environment variable to a strong, randomly generated key (min 32 characters)

2. **Use Key Management Service**: Store master key in AWS KMS, Google Secret Manager, or HashiCorp Vault

3. **Rotate Keys Periodically**: Plan for key rotation every 90 days

4. **Monitor Access**: Log all vault access operations

5. **Backup Encrypted Data**: Store encrypted credentials in secure backup location

6. **Audit Access Rules**: Review service access permissions regularly

### Development

Current default master key is for development only:
```
VAULT_MASTER_KEY=codex-vault-master-key-change-in-production
```

**⚠️ WARNING**: Never use default master key in production!

---

## Integration Examples

### Store TikTok Credentials

```javascript
const response = await fetch('http://localhost:5175/vault/store', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'tiktok_login',
    scope: 'SOCIAL',
    name: 'Brand Account #1',
    username: 'brandaccount1',
    email: 'brand@company.com',
    data: {
      password: 'secure_password_here',
      sessionToken: 'session_token_here',
      cookies: { /* session cookies */ }
    },
    metadata: {
      accountId: 'tiktok_123456',
      purpose: 'brand_posting'
    },
    tags: ['primary', 'brand', 'active']
  })
});

const { id } = await response.json();
console.log(`Stored credential: ${id}`);
```

### Retrieve Credentials from Hands v5

```javascript
// Hands v5 can read SOCIAL and DOMAIN scopes
const response = await fetch('http://localhost:5175/vault/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'uuid-123',
    requestingService: 'codex-hands-v5'
  })
});

const credential = await response.json();
console.log('Username:', credential.username);
console.log('Password:', credential.data.password);
```

### List All Social Credentials

```javascript
const response = await fetch('http://localhost:5175/vault/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestingService: 'codex-orchestrator',
    scope: 'SOCIAL',
    tags: ['active']
  })
});

const { count, credentials } = await response.json();
console.log(`Found ${count} active social credentials`);
```

---

## Orchestrator Integration

The vault is integrated with the Orchestrator on port 4200. All `/vault/*` routes are proxied:

```bash
# Via Orchestrator
curl http://localhost:4200/vault/health

# Direct to Vault
curl http://localhost:5175/health
```

---

## Error Handling

### 404 - Not Found
- Credential doesn't exist
- Service lacks access to scope

### 400 - Bad Request
- Invalid credential type
- Invalid scope
- Missing required fields

### 500 - Internal Error
- Encryption/decryption failure
- Vault storage error

---

## Monitoring

Monitor these metrics:
- Total credentials stored
- Credentials by scope
- Credentials by type
- Failed access attempts
- Encryption/decryption performance

---

## Next Steps

1. **Key Rotation**: Implement automated key rotation
2. **HSM Integration**: Connect to Hardware Security Module
3. **Audit Logs**: Add detailed access logging to Brain v2
4. **Backup/Restore**: Implement encrypted backup system
5. **Multi-Factor**: Add MFA for sensitive operations
6. **Credential Expiry**: Automatic cleanup of expired credentials
7. **Access Webhooks**: Notify on suspicious access patterns

---

**Credential Vault v2 (Iron Vault)** - Secure credential management for Codex OS 🔐
