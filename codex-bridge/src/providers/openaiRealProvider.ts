import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const OPENAI_API_URL = process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1";

export class OpenAIRealProvider implements IModelProvider {
  name = "openai";
  models = ["gpt-4o", "gpt-5", "gpt-5-mini"];
  apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      // provider may be instantiated in environments without a key; health will report not ok
    }
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no OPENAI_API_KEY" };
    try {
      // lightweight health check: call models.list or /models (some APIs allow)
      const res = await fetch(`${OPENAI_API_URL}/models`, {
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
      return { output: "", usage: {} };
    }

    const body: any = {
      model: input.model ?? this.models[0],
      messages: input.messages.map(m => ({ role: m.role, content: m.content })),
    };
    if (typeof input.temperature === "number") body.temperature = input.temperature;
    if (typeof input.max_tokens === "number") body.max_tokens = input.max_tokens;

    const url = `${OPENAI_API_URL}/chat/completions`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`openai api error ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    // support typical OpenAI chat response structure
    const choice = Array.isArray(data.choices) && data.choices[0];
    const output = (choice?.message?.content ?? choice?.text ?? data?.output ?? "").toString();
    const usage = data.usage ?? { prompt_tokens: undefined, completion_tokens: undefined, total_tokens: undefined };

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
