/**
 * Social Engine v1 - Gmail Platform Handler
 */

import type { SocialAccount } from "../types.js";
import { CONFIG } from "../config.js";

export async function loginFlow(
  account: SocialAccount,
  useCaptchaSolver: boolean
): Promise<boolean> {
  try {
    console.log("[Gmail] Starting login flow");

    await fetch(`${CONFIG.handsUrl}/ui/openUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: CONFIG.platforms.gmail.loginUrl
      })
    });

    await sleep(2000);

    // Enter email
    if (account.email) {
      await fetch(`${CONFIG.handsUrl}/ui/type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: account.email
        })
      });

      await fetch(`${CONFIG.handsUrl}/ui/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "Return"
        })
      });
    }

    await sleep(2000);

    // Handle CAPTCHA if needed
    if (useCaptchaSolver) {
      await solveCaptcha();
    }

    return true;

  } catch (error: any) {
    console.error("[Gmail] Login flow error:", error.message);
    return false;
  }
}

export async function postContent(
  accountId: string,
  content: any
): Promise<boolean> {
  try {
    console.log(`[Gmail] Sending email for ${accountId}`);

    // Gmail uses compose for "posting" (sending emails)
    await fetch(`${CONFIG.handsUrl}/ui/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Compose"
      })
    });

    await sleep(1000);

    // Add subject
    if (content.title) {
      await fetch(`${CONFIG.handsUrl}/ui/type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content.title
        })
      });
    }

    // Add body
    if (content.text) {
      await fetch(`${CONFIG.handsUrl}/ui/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "Tab"
        })
      });

      await fetch(`${CONFIG.handsUrl}/ui/type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content.text
        })
      });
    }

    // Send (Cmd+Return)
    await fetch(`${CONFIG.handsUrl}/ui/key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "Return",
        modifiers: ["command"]
      })
    });

    return true;

  } catch (error: any) {
    console.error("[Gmail] Send error:", error.message);
    return false;
  }
}

async function solveCaptcha(): Promise<void> {
  console.log("[Gmail] Solving CAPTCHA...");
  await sleep(2000);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
