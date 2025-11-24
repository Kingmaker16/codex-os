// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Token Manager (OAuth Token Refresh & Rotation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { OAUTH_CLIENTS, PLATFORM_ENDPOINTS } from "../config.js";
import { getCredential, storeCredential } from "./credentialVault.js";
import type { Platform, Credential, TokenInfo } from "../types.js";

/**
 * Check if token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Date.now();
  const buffer = 5 * 60 * 1000; // 5 minutes
  return now >= expiresAt - buffer;
}

/**
 * Refresh OAuth token for a platform
 */
export async function refreshToken(
  platform: Platform,
  accountId: string
): Promise<Credential | null> {
  const credential = await getCredential(platform, accountId);
  
  if (!credential || !credential.refreshToken) {
    return null;
  }
  
  try {
    let response;
    
    switch (platform) {
      case "youtube":
      case "gmail": {
        // Google OAuth refresh
        const config = OAUTH_CLIENTS.youtube;
        response = await axios.post("https://oauth2.googleapis.com/token", {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: credential.refreshToken,
          grant_type: "refresh_token",
        });
        
        const newCredential: Credential = {
          ...credential,
          accessToken: response.data.access_token,
          expiresAt: Date.now() + response.data.expires_in * 1000,
        };
        
        await storeCredential(platform, accountId, newCredential);
        return newCredential;
      }
      
      case "tiktok": {
        // TikTok OAuth refresh
        const config = OAUTH_CLIENTS.tiktok;
        response = await axios.post(`${PLATFORM_ENDPOINTS.tiktok}/oauth/token/`, {
          client_key: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: credential.refreshToken,
          grant_type: "refresh_token",
        });
        
        const newCredential: Credential = {
          ...credential,
          accessToken: response.data.data.access_token,
          refreshToken: response.data.data.refresh_token,
          expiresAt: Date.now() + response.data.data.expires_in * 1000,
        };
        
        await storeCredential(platform, accountId, newCredential);
        return newCredential;
      }
      
      case "instagram": {
        // Instagram/Facebook token refresh
        const config = OAUTH_CLIENTS.instagram;
        response = await axios.get(`${PLATFORM_ENDPOINTS.instagram}/oauth/access_token`, {
          params: {
            grant_type: "fb_exchange_token",
            client_id: config.clientId,
            client_secret: config.clientSecret,
            fb_exchange_token: credential.accessToken,
          },
        });
        
        const newCredential: Credential = {
          ...credential,
          accessToken: response.data.access_token,
          expiresAt: Date.now() + response.data.expires_in * 1000,
        };
        
        await storeCredential(platform, accountId, newCredential);
        return newCredential;
      }
      
      default:
        return null;
    }
  } catch (error: any) {
    console.error(`Failed to refresh token for ${platform}:${accountId}:`, error.message);
    return null;
  }
}

/**
 * Get valid token for a platform (auto-refresh if expired)
 */
export async function getValidToken(
  platform: Platform,
  accountId: string
): Promise<string | null> {
  let credential = await getCredential(platform, accountId);
  
  if (!credential) {
    return null;
  }
  
  // Check if token is expired
  if (credential.expiresAt && isTokenExpired(credential.expiresAt)) {
    console.log(`Token expired for ${platform}:${accountId}, refreshing...`);
    credential = await refreshToken(platform, accountId);
    
    if (!credential) {
      return null;
    }
  }
  
  return credential.accessToken || null;
}

/**
 * Get token info
 */
export async function getTokenInfo(
  platform: Platform,
  accountId: string
): Promise<TokenInfo | null> {
  const credential = await getCredential(platform, accountId);
  
  if (!credential || !credential.accessToken) {
    return null;
  }
  
  const isValid = credential.expiresAt ? !isTokenExpired(credential.expiresAt) : true;
  
  return {
    platform,
    accountId,
    accessToken: credential.accessToken,
    refreshToken: credential.refreshToken,
    expiresAt: credential.expiresAt || 0,
    isValid,
  };
}

/**
 * Rotate tokens for all platforms (background job)
 */
export async function rotateAllTokens(): Promise<void> {
  console.log("Starting token rotation job...");
  
  // In production, iterate through all stored credentials
  // For now, this is a placeholder for the background job
}
