import type { Page } from "playwright";

interface VisionSolveRequest {
  sessionId: string;
  hint?: string;
  instructions?: string;
}

interface VisionSolveClick {
  selector?: string;
  // optionally coordinates relative to viewport or element
  x?: number;
  y?: number;
}

interface VisionSolveResult {
  ok: boolean;
  clicks?: VisionSolveClick[];
  type?: string;
  error?: string;
}

// Helper to capture screenshot (full page for now; captcha-region targeting can come later)
export async function capturePageScreenshot(page: Page): Promise<Buffer> {
  const buf = await page.screenshot({ fullPage: true });
  return buf;
}

export async function sendScreenshotToCodex(
  req: VisionSolveRequest,
  image: Buffer
): Promise<VisionSolveResult> {
  // Stub mode for development/testing
  if (process.env.VISION_SOLVER_STUB === "true") {
    return {
      ok: true,
      clicks: [],
    };
  }

  // Call Orchestrator "vision solver" endpoint
  // POST http://localhost:4200/vision/solveCaptcha
  //
  // Body:
  // {
  //   "sessionId": string,
  //   "imageBase64": string,
  //   "hint"?: string,
  //   "instructions"?: string
  // }
  //
  // Response:
  // {
  //   "ok": true,
  //   "clicks": [
  //     { "selector": "css=..." } or { "x": 123, "y": 456 }
  //   ]
  // }

  const imageBase64 = image.toString("base64");
  const body = {
    sessionId: req.sessionId,
    imageBase64,
    hint: req.hint ?? "",
    instructions:
      req.instructions ??
      "Solve the visual challenge and return which elements to click. If grid, return approximate coordinates or selectors.",
  };

  try {
    const resp = await fetch("http://localhost:4200/vision/solveCaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        ok: false,
        error: `Vision solver error: ${resp.status} ${text}`,
      };
    }

    const data = (await resp.json()) as any;
    if (data.ok && Array.isArray(data.clicks)) {
      return { ok: true, clicks: data.clicks as VisionSolveClick[] };
    }

    return { ok: false, error: data.error || "Unknown vision solver error" };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}
