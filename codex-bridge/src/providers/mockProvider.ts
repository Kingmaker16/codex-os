// src/providers/mockProvider.ts
import { IModelProvider, ModelRequest, ModelResponse, HealthStatus } from "./types.js";

export class MockProvider implements IModelProvider {
  name = "mock";
  models = ["mock"];

  async health(): Promise<HealthStatus> {
    return { ok: true, provider: this.name, models: this.models };
  }

  async respond(input: ModelRequest): Promise<ModelResponse> {
    const last = input.messages[input.messages.length - 1];
    const content = last?.content ?? "";
    const model = input.model ?? "mock";
    return {
      output: `[mock:${model}] echo: ${content}`,
      usage: { prompt_tokens: (content.length || 1), completion_tokens: 5 }
    };
  }
}