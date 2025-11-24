import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const GEMINI_API_BASE = process.env.GOOGLE_API_BASE ?? "https://generativelanguage.googleapis.com";

export class GeminiProvider implements IModelProvider {
  name = "gemini";
  models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  apiKey?: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no GOOGLE_API_KEY" };
    try {
      // No lightweight public health endpoint; assume ok if key present
      return { ok: true, provider: this.name, models: this.models };
    } catch (err: any) {
      return { ok: false, provider: this.name, error: err?.message ?? String(err) };
    }
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      return { output: "Gemini provider not configured (missing GOOGLE_API_KEY)", usage: {} };
    }

    const model =
      input.model && input.model.trim() !== ""
        ? input.model.trim()
        : "gemini-2.5-flash";

    const url = `${GEMINI_API_BASE}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const body = {
      contents: [
        {
          parts: input.messages.map(m => ({ text: m.content }))
        }
      ]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`gemini api error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    const output = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "") as string;

    return {
      output,
      usage: {
        prompt_tokens: undefined,
        completion_tokens: undefined,
        total_tokens: undefined,
      }
    };
  }
}
