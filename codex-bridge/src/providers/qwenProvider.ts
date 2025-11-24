import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

const QWEN_API_BASE = process.env.QWEN_API_BASE ?? "https://dashscope.aliyuncs.com/api/v1";

/**
 * Qwen Provider - Alibaba Cloud's Qwen LLM
 * 
 * Role: Data analysis, multilingual reasoning, e-commerce intelligence, global trend mapping
 * Models: qwen-turbo, qwen-plus, qwen-max
 * 
 * API Documentation: https://help.aliyun.com/zh/dashscope/
 */
export class QwenProvider implements IModelProvider {
  name = "qwen";
  models = ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"];
  apiKey?: string;

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY;
  }

  async health(): Promise<HealthStatus> {
    if (!this.apiKey) return { ok: false, provider: this.name, error: "no QWEN_API_KEY" };
    try {
      // Qwen uses DashScope API - no public health endpoint, assume ok if key present
      return { ok: true, provider: this.name, models: this.models };
    } catch (err: any) {
      return { ok: false, provider: this.name, error: err?.message ?? String(err) };
    }
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      return { output: "Qwen provider not configured (missing QWEN_API_KEY)", usage: {} };
    }

    const model =
      input.model && input.model.trim() !== ""
        ? input.model.trim()
        : "qwen-max";

    const url = `${QWEN_API_BASE}/services/aigc/text-generation/generation`;

    const body = {
      model: model,
      input: {
        messages: input.messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      },
      parameters: {
        temperature: input.temperature ?? 0.7,
        max_tokens: input.max_tokens ?? 2000,
        top_p: 0.8,
        enable_search: false,
        result_format: "message"
      }
    };

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
      throw new Error(`qwen api error ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    
    // DashScope response format: { output: { choices: [{ message: { content: "..." } }] }, usage: {...} }
    const output = (data.output?.choices?.[0]?.message?.content ?? 
                   data.output?.text ?? "") as string;
    const usage = data.usage ?? {};

    return {
      output,
      usage: {
        prompt_tokens: usage.input_tokens,
        completion_tokens: usage.output_tokens,
        total_tokens: usage.total_tokens,
      }
    };
  }
}
