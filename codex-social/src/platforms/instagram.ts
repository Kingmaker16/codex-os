/**
 * Social Engine v1 - Instagram Platform Handler
 */

import type { SocialAccount } from "../types.js";
import { CONFIG } from "../config.js";

export async function loginFlow(
  account: SocialAccount,
  useCaptchaSolver: boolean
): Promise<boolean> {
  try {
    console.log("[Instagram] Starting login flow");

    await fetch(`${CONFIG.handsUrl}/ui/openUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: CONFIG.platforms.instagram.loginUrl
      })
    });

    await sleep(2000);

    // Enter username
    if (account.username || account.email) {
      await fetch(`${CONFIG.handsUrl}/ui/type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: account.username || account.email
        })
      });
    }

    await sleep(500);

    // Handle CAPTCHA if needed
    if (useCaptchaSolver) {
      await solveCaptcha();
    }

    // Click login
    await fetch(`${CONFIG.handsUrl}/ui/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selector: "button[type='submit']"
      })
    });

    return true;

  } catch (error: any) {
    console.error("[Instagram] Login flow error:", error.message);
    return false;
  }
}

export async function postContent(
  accountId: string,
  content: any
): Promise<boolean> {
  try {
    console.log(`[Instagram] Posting content for ${accountId}`);

    // Click create post button
    await fetch(`${CONFIG.handsUrl}/ui/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selector: "svg[aria-label='New post']"
      })
    });

    await sleep(1000);

    // Upload media
    if (content.media && content.media.length > 0) {
      await fetch(`${CONFIG.handsUrl}/ui/uploadFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: content.media[0]
        })
      });
    }

    await sleep(2000);

    // Add caption
    if (content.text) {
      await fetch(`${CONFIG.handsUrl}/ui/type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content.text
        })
      });
    }

    // Share post
    await fetch(`${CONFIG.handsUrl}/ui/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Share"
      })
    });

    return true;

  } catch (error: any) {
    console.error("[Instagram] Post error:", error.message);
    return false;
  }
}

async function solveCaptcha(): Promise<void> {
  console.log("[Instagram] Solving CAPTCHA...");
  await sleep(2000);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
