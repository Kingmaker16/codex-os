import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const MANUS_API_BASE = process.env.MANUS_API_BASE ?? "https://api.manus.ai/v1";

export class ManusProvider implements IModelProvider {
  name = "manus";
  models = ["manus-chat", "manus-coder"];
  apiKey?: string;

  constructor() {
    this.apiKey = process.env.MANUS_API_KEY;
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no MANUS_API_KEY" };
    try {
      const res = await fetch(`${MANUS_API_BASE}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      if (!res.ok) return { ok: false, provider: this.name, error: `status ${res.status}` };
      return { ok: true, provider: this.name, models: this.models };
    } catch (err: any) {
      return { ok: false, provider: this.name, error: err?.message ?? String(err) };
    }
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      return { output: "Manus provider not configured (missing MANUS_API_KEY)", usage: {} };
    }

    const body: any = {
      model: input.model ?? this.models[0],
      messages: input.messages.map(m => ({ role: m.role, content: m.content })),
      temperature: typeof input.temperature === "number" ? input.temperature : 0.7,
      max_tokens: typeof input.max_tokens === "number" ? input.max_tokens : 512,
    };

    const url = `${MANUS_API_BASE}/chat/completions`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`manus api error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    const choice = Array.isArray(data.choices) && data.choices[0];
    const output = (choice?.message?.content ?? choice?.text ?? data?.output ?? "").toString();
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
