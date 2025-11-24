import { getCaptchaConfig } from "./captchaConfig.js";

export interface CaptchaSolveRequest {
  siteKey: string;
  url: string;
  type?: "recaptcha_v2" | "recaptcha_v3" | "hcaptcha" | "turnstile";
}

export interface CaptchaSolveResponse {
  ok: boolean;
  token?: string;
  error?: string;
}

export async function solveCaptcha(
  req: CaptchaSolveRequest
): Promise<CaptchaSolveResponse> {
  const cfg = getCaptchaConfig();
  if (!cfg.enabled) {
    return { ok: false, error: "Captcha solving is disabled." };
  }
  if (!cfg.apiKey) {
    return { ok: false, error: "Captcha API key not configured." };
  }

  try {
    // Generic example payload. Real providers differ slightly.
    const body = {
      apiKey: cfg.apiKey,
      siteKey: req.siteKey,
      url: req.url,
      type: req.type || "recaptcha_v2",
    };

    const resp = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        ok: false,
        error: `Captcha provider error: ${resp.status} ${text}`,
      };
    }

    const data = (await resp.json()) as any;
    // Expecting { ok: true, token: "..." } shape
    if (data.ok && typeof data.token === "string") {
      return { ok: true, token: data.token };
    }

    return {
      ok: false,
      error: data.error || "Unknown captcha provider failure",
    };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}
