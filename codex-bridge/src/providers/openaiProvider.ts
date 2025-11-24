// src/providers/openaiProvider.ts
import { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

export class OpenAIProvider implements IModelProvider {
  name = "openai";
  models = ["gpt-5-thinking", "gpt-4o", "gpt-4o-mini"];

  async health(): Promise<HealthStatus> {
    // Real check would ping the API using a key; stubbed OK for now
    return { ok: true, provider: this.name, models: this.models };
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    // Stubbed response — we’ll wire real API calls later
    const last = input.messages.at(-1)?.content ?? "";
    return {
      output: `[openai:${input.model}] (stub) saw: ${last}`,
      usage: { prompt_tokens: last.length || 1, completion_tokens: 12 }
    };
  }
}