import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const ANTHROPIC_API_URL = process.env.ANTHROPIC_API_BASE ?? "https://api.anthropic.com/v1";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-haiku-20241022";

export class AnthropicProvider implements IModelProvider {
  name = "claude";
  models = ["claude", "claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229"];
  apiKey?: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no ANTHROPIC_API_KEY" };
    try {
      const res = await fetch(`${ANTHROPIC_API_URL}/models`, {
        headers: { "x-api-key": this.apiKey }
      });
      if (!res.ok) return { ok: false, provider: this.name, error: `status ${res.status}` };
      return { ok: true, provider: this.name, models: this.models };
    } catch (err: any) {
      return { ok: false, provider: this.name, error: err?.message ?? String(err) };
    }
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      return { output: `(claude stub) missing ANTHROPIC_API_KEY`, usage: {} };
    }

    const model = input.model && input.model.trim() !== ""
      ? input.model.trim()
      : CLAUDE_MODEL;

    const systemMessages = Array.isArray(input.messages)
      ? input.messages.filter(m => m.role === "system")
      : [];
    const nonSystemMessages = Array.isArray(input.messages)
      ? input.messages.filter(m => m.role !== "system")
      : [];

    const system = systemMessages.length
      ? systemMessages.map(m => m.content).join("\n\n")
      : undefined;

    const messages = nonSystemMessages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const body: any = {
      model: model,
      max_tokens: input.max_tokens ?? 512,
      messages,
    };

    if (system) {
      body.system = system;
    }

    const url = `${ANTHROPIC_API_URL}/messages`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`anthropic api error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    // extract assistant text per spec
    const output = (data?.content && Array.isArray(data.content) && data.content[0]?.text) ? String(data.content[0].text) : (data?.output ?? "");

    const input_tokens = data?.usage?.input_tokens ?? undefined;
    const output_tokens = data?.usage?.output_tokens ?? undefined;
    const total = (typeof input_tokens === "number" && typeof output_tokens === "number") ? (input_tokens + output_tokens) : undefined;

    return {
      output,
      usage: {
        prompt_tokens: input_tokens,
        completion_tokens: output_tokens,
        total_tokens: total,
      }
    };
  }
}
