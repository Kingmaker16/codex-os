import type { Page } from "playwright";
import { capturePageScreenshot, sendScreenshotToCodex } from "./webVision.js";
import { getPage } from "./webSession.js";

export type CaptchaType =
  | "grid"
  | "slider"
  | "object-select"
  | "rotate"
  | "text-fuzzy"
  | "token-only"
  | "unknown"
  | "none";

export interface CaptchaDetectionResult {
  present: boolean;
  type: CaptchaType;
  // If token-based solver might apply:
  siteKey?: string;
  url?: string;
  // Optional debug info:
  source: "dom" | "vision" | "none";
  details?: string;
}

// DOM-based detection
export async function detectCaptchaDom(page: Page): Promise<CaptchaDetectionResult> {
  const res = await page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll("iframe"));
    const text = document.body?.innerText || "";
    const classes = Array.from(document.querySelectorAll<HTMLElement>("[class]")).map(el => el.className);

    let found = false;
    let type = "unknown";
    let siteKey: string | undefined;

    // reCAPTCHA detection
    const recaptchaIframe = iframes.find((f) =>
      (f.getAttribute("src") || "").includes("recaptcha")
    );
    if (recaptchaIframe) {
      found = true;
      type = "grid";
    }

    // hCaptcha
    const hcaptchaIframe = iframes.find((f) =>
      (f.getAttribute("src") || "").includes("hcaptcha.com")
    );
    if (hcaptchaIframe) {
      found = true;
      type = "object-select";
    }

    // Look for g-recaptcha-response fields and sitekey attributes
    const recaptchaElements = Array.from(document.querySelectorAll<HTMLElement>(".g-recaptcha, [data-sitekey]"));
    if (recaptchaElements.length > 0) {
      found = true;
      const sk = recaptchaElements[0].getAttribute("data-sitekey");
      if (sk) {
        siteKey = sk;
      }
    }

    // Basic heuristic: text hints
    const lower = text.toLowerCase();
    if (!found && (lower.includes("i am not a robot") || lower.includes("i'm not a robot"))) {
      found = true;
      type = "token-only";
    }

    return {
      found,
      type,
      siteKey,
      classes,
      hintText: lower.slice(0, 2000)
    };
  });

  if (!res.found) {
    return {
      present: false,
      type: "none",
      source: "dom" as const
    };
  }

  return {
    present: true,
    type: (res.type as CaptchaType) || "unknown",
    siteKey: res.siteKey,
    source: "dom" as const,
    details: "Detected via DOM heuristics"
  };
}

// Vision-based detection via Orchestrator Vision Solver
export async function detectCaptchaVision(page: Page, sessionId: string): Promise<CaptchaDetectionResult> {
  const screenshot = await capturePageScreenshot(page);
  const visionResult = await sendScreenshotToCodex(
    {
      sessionId,
      hint: "Determine if there is a CAPTCHA on this page and classify its type. If none, say none.",
      instructions:
        "Return a JSON object with keys: present (boolean), type (string: grid|slider|object-select|rotate|text-fuzzy|none), and optional details. Do NOT include explanations, only JSON."
    },
    screenshot
  );

  if (!visionResult.ok || !visionResult.clicks) {
    return {
      present: false,
      type: "none",
      source: "vision",
      details: visionResult.error || "Vision solver could not classify"
    };
  }

  // We'll treat presence as true if any clicks returned or if type!==none
  const type = (visionResult.type as CaptchaType) || "unknown";
  const present = type !== "none";

  return {
    present,
    type,
    source: "vision",
    details: "Detected via vision pipeline"
  };
}

// Hybrid detector: try DOM first, then vision if needed
export async function detectCaptchaHybrid(sessionId: string): Promise<CaptchaDetectionResult> {
  const page = await getPage(sessionId.trim());
  const domResult = await detectCaptchaDom(page);
  if (domResult.present) {
    return domResult;
  }

  // If VISION_SOLVER_STUB is true, skip vision to avoid noise
  if (process.env.VISION_SOLVER_STUB === "true") {
    return {
      present: false,
      type: "none",
      source: "none",
      details: "Vision stub bypassed"
    };
  }

  const visionResult = await detectCaptchaVision(page, sessionId);
  return visionResult;
}
