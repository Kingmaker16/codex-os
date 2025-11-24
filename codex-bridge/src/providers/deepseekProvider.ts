import type { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

export class DeepseekProvider implements IModelProvider {
  name = "deepseek";
  models = ["deepseek-chat", "deepseek-coder"];

  async health(): Promise<HealthStatus> {
    // Real implementation would ping DeepSeek's API; stub is always OK for now
    return { ok: true, provider: this.name, models: this.models };
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    // Stubbed response — we'll later replace with real HTTP calls
    const last = input.messages.at(-1)?.content ?? "";
    return {
      output: `[deepseek:${input.model ?? "deepseek-coder"}] (stub) saw: ${last}`,
      usage: { prompt_tokens: last.length || 1, completion_tokens: 10 }
    };
  }
}