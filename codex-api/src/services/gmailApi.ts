// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Gmail Send/Read (OAuth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { PLATFORM_ENDPOINTS } from "../config.js";
import { getValidToken } from "./tokenManager.js";
import { checkRateLimit } from "./rateLimitGuard.js";

/**
 * Send email via Gmail API
 */
export async function sendGmailEmail(
  accountId: string,
  to: string,
  subject: string,
  body: string,
  attachments?: Array<{ filename: string; content: string }>
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  // Check rate limit
  const rateLimit = checkRateLimit("gmail", accountId);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
    };
  }
  
  // Get valid access token
  const accessToken = await getValidToken("gmail", accountId || "default");
  if (!accessToken) {
    return {
      ok: false,
      error: "No valid access token found. Please authenticate first.",
    };
  }
  
  try {
    // Create email in RFC 2822 format
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\r\n");
    
    // Encode email to base64url
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    const response = await axios.post(
      `${PLATFORM_ENDPOINTS.gmail}/users/me/messages/send`,
      {
        raw: encodedEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return {
      ok: true,
      messageId: response.data.id,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

/**
 * Read Gmail messages
 */
export async function readGmailMessages(
  accountId: string,
  maxResults: number = 10,
  query?: string
): Promise<any[]> {
  const accessToken = await getValidToken("gmail", accountId);
  
  if (!accessToken) {
    return [];
  }
  
  try {
    const response = await axios.get(
      `${PLATFORM_ENDPOINTS.gmail}/users/me/messages`,
      {
        params: {
          maxResults,
          q: query,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    return response.data.messages || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get Gmail message details
 */
export async function getGmailMessage(
  accountId: string,
  messageId: string
): Promise<any> {
  const accessToken = await getValidToken("gmail", accountId);
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const response = await axios.get(
      `${PLATFORM_ENDPOINTS.gmail}/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    return null;
  }
}
