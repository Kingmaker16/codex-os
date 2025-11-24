export interface ServiceConfig {
  name: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  { name: "brain", baseUrl: "http://localhost:4100", timeoutMs: 3000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "bridge", baseUrl: "http://localhost:4000", timeoutMs: 8000, maxRetries: 1, circuitBreakerThreshold: 3 },
  { name: "strategy", baseUrl: "http://localhost:5050", timeoutMs: 4000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "trends", baseUrl: "http://localhost:5060", timeoutMs: 4000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "creative", baseUrl: "http://localhost:5250", timeoutMs: 8000, maxRetries: 1, circuitBreakerThreshold: 3 },
  { name: "video", baseUrl: "http://localhost:4700", timeoutMs: 8000, maxRetries: 1, circuitBreakerThreshold: 3 },
  { name: "social", baseUrl: "http://localhost:4800", timeoutMs: 6000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "ecomm", baseUrl: "http://localhost:5100", timeoutMs: 6000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "distribution", baseUrl: "http://localhost:5300", timeoutMs: 6000, maxRetries: 2, circuitBreakerThreshold: 5 },
  { name: "ops", baseUrl: "http://localhost:5350", timeoutMs: 4000, maxRetries: 1, circuitBreakerThreshold: 3 }
];
