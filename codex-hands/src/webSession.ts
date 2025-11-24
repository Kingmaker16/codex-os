import { chromium, Browser, BrowserContext, Page } from "playwright";

// Persistent profile directory for cookies/localStorage
const USER_DATA_DIR = "/Users/amar/Codex/.codex-playwright-profile";

// Singleton context instance
let context: BrowserContext | null = null;

async function getBrowserAndContext(): Promise<{ browser: Browser; context: BrowserContext }> {
  if (!context) {
    // Use launchPersistentContext for persistent profile
    context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
      ],
      viewport: { width: 1440, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
    });
  }
  // Note: launchPersistentContext returns a BrowserContext, not a Browser
  // We'll return the context twice for compatibility
  return { browser: context.browser()!, context };
}

// Page session management
const pages = new Map<string, Page>();

export async function getPage(sessionId: string): Promise<Page> {
  const { context } = await getBrowserAndContext();
  let page = pages.get(sessionId);
  if (!page) {
    page = await context.newPage();

    // Inject anti-detection script
    await page.addInitScript(() => {
      // Mask automation indicators
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    pages.set(sessionId, page);
  }
  return page;
}

// Cleanup functions
export async function closeAllPages() {
  for (const page of pages.values()) {
    await page.close().catch(() => {});
  }
  pages.clear();
}

export async function closeBrowser() {
  if (context) {
    await context.close().catch(() => {});
    context = null;
  }
}

// Human-like delay utilities
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(base: number, jitter: number = 250): number {
  const delta = Math.floor(Math.random() * jitter * 2) - jitter;
  return Math.max(0, base + delta);
}

export async function humanDelay(base: number = 300): Promise<void> {
  const ms = randomDelay(base, 200);
  await sleep(ms);
}

// Domain whitelist for web automation
const ALLOWED_DOMAINS = [
  "tiktok.com",
  "www.tiktok.com",
  "google.com",
  "www.google.com",
  "minea.com",
  "app.minea.com",
  "shopify.com",
  "www.shopify.com",
];

export function validateUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    throw new Error(`Domain not allowed: ${parsed.hostname}`);
  }
  return parsed;
}
