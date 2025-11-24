// src/providers/types.ts

export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelRequest {
  model: string;
  messages: Message[];
  tools?: ToolCall[];
  max_tokens?: number;
  temperature?: number;
}

export interface ModelResponse {
  output: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  toolCalls?: ToolCall[];
}

export interface HealthStatus {
  ok: boolean;
  provider: string;
  models?: string[];
  error?: string;
}

export interface IModelProvider {
  name: string;
  models: string[];
  health(): Promise<HealthStatus>;
  respond(input: ModelRequest): Promise<ModelResponse>;
}