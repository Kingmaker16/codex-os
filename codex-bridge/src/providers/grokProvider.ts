import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const XAI_API_URL = process.env.XAI_API_BASE ?? "https://api.x.ai/v1";

export class GrokProvider implements IModelProvider {
  name = "grok";
  models = ["grok-1", "grok-1.5"];
  apiKey?: string;

  constructor() {
    this.apiKey = process.env.XAI_API_KEY;
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no XAI_API_KEY" };
    try {
      const res = await fetch(`${XAI_API_URL}/models`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
      if (!res.ok) return { ok: false, provider: this.name, error: `status ${res.status}` };
      return { ok: true, provider: this.name, models: this.models };
    } catch (err: any) {
      return { ok: false, provider: this.name, error: err?.message ?? String(err) };
    }
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      return { output: "Grok provider not configured (missing XAI_API_KEY)", usage: {} };
    }
    const model =
      input.model && input.model.trim() !== ""
        ? input.model.trim()
        : "grok-4-latest";

    const body = {
      model: model,
      messages: input.messages.map(m => ({ role: m.role, content: m.content })),
      temperature: input.temperature ?? 0.7,
      stream: false,
      max_tokens: input.max_tokens ?? 512,
    };

    const url = "https://api.x.ai/v1/chat/completions";

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`grok api error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    const output = (data.choices?.[0]?.message?.content ?? "") as string;
    const usage = data.usage ?? {};

    return {
      output,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      }
    };
  }
}
